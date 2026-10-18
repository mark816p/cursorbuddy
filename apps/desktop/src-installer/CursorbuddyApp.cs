using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Reflection;
using System.Windows.Forms;

namespace Cursorbuddy
{
    static class Program
    {
        private static NotifyIcon trayIcon;
        private static ContextMenuStrip trayMenu;
        private static bool isPaused = false;
        private static Process browserProcess = null;

        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            string appDir = AppDomain.CurrentDomain.BaseDirectory;
            string htmlPath = Path.Combine(appDir, "resources", "index.html");

            trayMenu = new ContextMenuStrip();
            trayMenu.Items.Add("Open Cursorbuddy", null, (s, e) => LaunchAppWindow(htmlPath));
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
                Application.Exit();
            });

            // Tray Icon Setup
            trayIcon = new NotifyIcon();
            trayIcon.Text = "Cursorbuddy AI Companion";
            trayIcon.ContextMenuStrip = trayMenu;

            string iconPath = Path.Combine(appDir, "resources", "icon.ico");
            if (File.Exists(iconPath))
            {
                trayIcon.Icon = new Icon(iconPath);
            }
            else
            {
                trayIcon.Icon = SystemIcons.Application;
            }

            trayIcon.Visible = true;
            trayIcon.DoubleClick += (s, e) => LaunchAppWindow(htmlPath);

            trayIcon.ShowBalloonTip(
                2500,
                "Cursorbuddy Active",
                "Cursorbuddy is running in your system tray.\nHold Ctrl+Alt to ask a voice question about your screen.",
                ToolTipIcon.Info
            );

            // Open window on launch
            LaunchAppWindow(htmlPath);

            Application.Run();
        }

        private static void LaunchAppWindow(string htmlPath)
        {
            if (browserProcess != null && !browserProcess.HasExited)
            {
                return;
            }

            if (!File.Exists(htmlPath))
            {
                MessageBox.Show("Could not find webview resource: " + htmlPath, "Cursorbuddy Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

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
                    Arguments = string.Format("--app=\"file:///{0}\" --window-size=850,620 --window-name=\"Cursorbuddy\"", htmlPath.Replace("\\", "/")),
                    UseShellExecute = false
                };
                browserProcess = Process.Start(psi);
            }
            else
            {
                Process.Start(new ProcessStartInfo(htmlPath) { UseShellExecute = true });
            }
        }
    }
}
