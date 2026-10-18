using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Reflection;
using System.Threading;
using System.Windows.Forms;

namespace Cursorbuddy
{
    static class Program
    {
        private static NotifyIcon trayIcon;
        private static ContextMenuStrip trayMenu;
        private static bool isPaused = false;
        private static Process browserProcess = null;
        private static HttpListener webListener = null;
        private static int serverPort = 0;
        private static string resourcesDir = "";

        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            string appDir = AppDomain.CurrentDomain.BaseDirectory;
            resourcesDir = Path.Combine(appDir, "resources");

            // Start loopback local HTTP server to avoid Chromium file:/// CORS restrictions on ES modules
            serverPort = StartWebServer(resourcesDir);

            trayMenu = new ContextMenuStrip();
            trayMenu.Items.Add("Open Cursorbuddy", null, (s, e) => LaunchAppWindow());
            trayMenu.Items.Add(new ToolStripSeparator());
            var pauseItem = trayMenu.Items.Add("Pause Companion", null, (s, e) =>
            {
                isPaused = !isPaused;
                var item = s as ToolStripMenuItem;
                if (item != null)
                {
                    item.Text = isPaused ? "Resume Companion" : "Pause Companion";
                }
                trayIcon.ShowBalloonTip(1500, "Cursorbuddy", isPaused ? "Companion Paused." : "Companion Active.", ToolTipIcon.Info);
            });
            trayMenu.Items.Add(new ToolStripSeparator());
            trayMenu.Items.Add("Documentation", null, (s, e) => Process.Start("https://mark816p.github.io/cursorbuddy/"));
            trayMenu.Items.Add("GitHub Repository", null, (s, e) => Process.Start("https://github.com/mark816p/cursorbuddy"));
            trayMenu.Items.Add("About Cursorbuddy", null, (s, e) =>
            {
                MessageBox.Show(
                    "Cursorbuddy v0.1.0\n\nAI Desktop Companion that teaches you where to click, never clicks for you.\n\nGlobal Hotkey: Ctrl + Alt\nDictation: Ctrl + Alt + Shift",
                    "About Cursorbuddy",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Information);
            });
            trayMenu.Items.Add(new ToolStripSeparator());
            trayMenu.Items.Add("Exit", null, (s, e) =>
            {
                trayIcon.Visible = false;
                if (browserProcess != null && !browserProcess.HasExited)
                {
                    try { browserProcess.Kill(); } catch { }
                }
                if (webListener != null)
                {
                    try { webListener.Stop(); } catch { }
                }
                Application.Exit();
            });

            // Tray Icon Setup
            trayIcon = new NotifyIcon();
            trayIcon.Text = "Cursorbuddy AI Companion";
            trayIcon.ContextMenuStrip = trayMenu;

            string iconPath = Path.Combine(resourcesDir, "icon.ico");
            if (File.Exists(iconPath))
            {
                trayIcon.Icon = new Icon(iconPath);
            }
            else
            {
                trayIcon.Icon = SystemIcons.Application;
            }

            trayIcon.Visible = true;
            trayIcon.DoubleClick += (s, e) => LaunchAppWindow();

            trayIcon.ShowBalloonTip(
                2500,
                "Cursorbuddy Active",
                "Cursorbuddy is running in your system tray.\nHold Ctrl+Alt to ask a voice question about your screen.",
                ToolTipIcon.Info
            );

            // Open app window on launch
            LaunchAppWindow();

            Application.Run();
        }

        private static int StartWebServer(string staticDir)
        {
            // Pick an available port on 127.0.0.1
            int port = 49215;
            TcpListener tcp = null;
            try
            {
                tcp = new TcpListener(IPAddress.Loopback, 0);
                tcp.Start();
                port = ((IPEndPoint)tcp.LocalEndpoint).Port;
                tcp.Stop();
            }
            catch
            {
                port = 49215;
            }

            try
            {
                webListener = new HttpListener();
                webListener.Prefixes.Add(string.Format("http://127.0.0.1:{0}/", port));
                webListener.Start();

                var worker = new Thread(() =>
                {
                    while (webListener != null && webListener.IsListening)
                    {
                        try
                        {
                            var ctx = webListener.GetContext();
                            ThreadPool.QueueUserWorkItem(state => ProcessRequest((HttpListenerContext)state, staticDir), ctx);
                        }
                        catch
                        {
                            // Listener stopped
                        }
                    }
                });
                worker.IsBackground = true;
                worker.Start();
            }
            catch (Exception ex)
            {
                Debug.WriteLine("HttpListener failed: " + ex.Message);
            }

            return port;
        }

        private static void ProcessRequest(HttpListenerContext context, string staticDir)
        {
            try
            {
                string rawUrl = context.Request.Url.AbsolutePath.TrimStart('/');
                if (string.IsNullOrEmpty(rawUrl))
                {
                    rawUrl = "index.html";
                }

                string filePath = Path.Combine(staticDir, rawUrl.Replace('/', Path.DirectorySeparatorChar));
                if (!File.Exists(filePath))
                {
                    // Fallback to index.html for SPA router support
                    filePath = Path.Combine(staticDir, "index.html");
                }

                if (File.Exists(filePath))
                {
                    byte[] data = File.ReadAllBytes(filePath);
                    string ext = Path.GetExtension(filePath).ToLowerInvariant();
                    string contentType = "application/octet-stream";

                    switch (ext)
                    {
                        case ".html": contentType = "text/html; charset=utf-8"; break;
                        case ".js":   contentType = "application/javascript; charset=utf-8"; break;
                        case ".css":  contentType = "text/css; charset=utf-8"; break;
                        case ".svg":  contentType = "image/svg+xml"; break;
                        case ".png":  contentType = "image/png"; break;
                        case ".ico":  contentType = "image/x-icon"; break;
                        case ".json": contentType = "application/json; charset=utf-8"; break;
                        case ".woff2": contentType = "font/woff2"; break;
                    }

                    context.Response.ContentType = contentType;
                    context.Response.ContentLength64 = data.Length;
                    context.Response.AddHeader("Cache-Control", "no-cache, no-store, must-revalidate");
                    context.Response.AddHeader("Access-Control-Allow-Origin", "*");
                    context.Response.OutputStream.Write(data, 0, data.Length);
                    context.Response.OutputStream.Close();
                }
                else
                {
                    context.Response.StatusCode = 404;
                    context.Response.Close();
                }
            }
            catch
            {
                try { context.Response.Close(); } catch { }
            }
        }

        private static void LaunchAppWindow()
        {
            if (browserProcess != null && !browserProcess.HasExited)
            {
                return;
            }

            string appUrl = string.Format("http://127.0.0.1:{0}/", serverPort);

            // Launch with Microsoft Edge App mode (Chromium Evergreen engine)
            string edgePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\Edge\Application\msedge.exe");
            if (!File.Exists(edgePath))
            {
                edgePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\Edge\Application\msedge.exe");
            }

            if (File.Exists(edgePath))
            {
                var psi = new ProcessStartInfo
                {
                    FileName = edgePath,
                    Arguments = string.Format("--app=\"{0}\" --window-size=920,660 --window-name=\"Cursorbuddy\"", appUrl),
                    UseShellExecute = false
                };
                browserProcess = Process.Start(psi);
            }
            else
            {
                // Fallback to system default browser
                Process.Start(new ProcessStartInfo(appUrl) { UseShellExecute = true });
            }
        }
    }
}
