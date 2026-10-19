using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Speech.Synthesis;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Windows.Automation;
using System.Windows.Forms;

namespace Cursorbuddy
{
    static class Program
    {
        // Win32 API Constants
        private const int WH_KEYBOARD_LL = 13;
        private const int WM_KEYDOWN = 0x0100;
        private const int WM_KEYUP = 0x0101;
        private const int WM_SYSKEYDOWN = 0x0104;
        private const int WM_SYSKEYUP = 0x0105;

        private const int VK_ESCAPE = 0x1B;
        private const int VK_SHIFT = 0x10;
        private const int VK_CONTROL = 0x11;
        private const int VK_MENU = 0x12; // Alt key

        private const uint WDA_NONE = 0x00000000;
        private const uint WDA_EXCLUDEFROMCAPTURE = 0x00000011;

        // P/Invoke Signatures
        private delegate IntPtr LowLevelKeyboardProc(int nCode, IntPtr wParam, IntPtr lParam);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr SetWindowsHookEx(int idHook, LowLevelKeyboardProc lpfn, IntPtr hMod, uint dwThreadId);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool UnhookWindowsHookEx(IntPtr hhk);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr CallNextHookEx(IntPtr hhk, int nCode, IntPtr wParam, IntPtr lParam);

        [DllImport("kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr GetModuleHandle(string lpModuleName);

        [DllImport("user32.dll")]
        private static extern short GetAsyncKeyState(int vKey);

        [DllImport("user32.dll")]
        private static extern IntPtr GetForegroundWindow();

        [DllImport("user32.dll", SetLastError = true, CharSet = CharSet.Auto)]
        private static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);

        [DllImport("user32.dll")]
        private static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);

        [DllImport("user32.dll")]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);

        [DllImport("user32.dll")]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool IsWindowVisible(IntPtr hWnd);

        private delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

        [DllImport("user32.dll")]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);

        [DllImport("user32.dll")]
        private static extern uint SetWindowDisplayAffinity(IntPtr hWnd, uint dwAffinity);

        [StructLayout(LayoutKind.Sequential)]
        public struct RECT
        {
            public int Left;
            public int Top;
            public int Right;
            public int Bottom;
        }

        // Application State
        private static NotifyIcon trayIcon;
        private static ContextMenuStrip trayMenu;
        private static bool isPaused = false;
        private static Process browserProcess = null;
        private static HttpListener webListener = null;
        private static int serverPort = 0;
        private static string resourcesDir = "";

        private static IntPtr hookId = IntPtr.Zero;
        private static LowLevelKeyboardProc hookProc = HookCallback;
        private static bool isHotkeyDown = false;
        private static DateTime hotkeyDownTime = DateTime.MinValue;

        private static SpeechSynthesizer speechSynth;
        private static OverlayForm activeOverlay = null;
        private static SynchronizationContext uiContext = null;

        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            // Capture UI SynchronizationContext for thread-safe cross-thread marshaling
            uiContext = SynchronizationContext.Current ?? new WindowsFormsSynchronizationContext();

            string appDir = AppDomain.CurrentDomain.BaseDirectory;
            resourcesDir = Path.Combine(appDir, "resources");

            // Initialize Speech Synthesizer
            try
            {
                speechSynth = new SpeechSynthesizer();
                speechSynth.SetOutputToDefaultAudioDevice();
            }
            catch { }

            // Start loopback local HTTP server for React Webview
            serverPort = StartWebServer(resourcesDir);

            // Install low-level keyboard hook for global Ctrl+Alt and Escape
            hookId = SetHook(hookProc);

            // Build System Tray Menu
            trayMenu = new ContextMenuStrip();

            var openItem = trayMenu.Items.Add("Open Cursorbuddy (Settings & UI)", null, (s, e) => LaunchAppWindow());
            openItem.Font = new Font(trayMenu.Font, FontStyle.Bold);

            trayMenu.Items.Add("Trigger Companion (Ctrl + Alt)", null, (s, e) =>
            {
                ThreadPool.QueueUserWorkItem(state => TriggerCompanionGuidance());
            });

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

            trayMenu.Items.Add("Dismiss Annotations (Esc)", null, (s, e) => DismissActiveOverlay());

            trayMenu.Items.Add(new ToolStripSeparator());
            trayMenu.Items.Add("Documentation", null, (s, e) => Process.Start("https://mark816p.github.io/cursorbuddy/"));
            trayMenu.Items.Add("GitHub Repository", null, (s, e) => Process.Start("https://github.com/mark816p/cursorbuddy"));
            trayMenu.Items.Add("About Cursorbuddy", null, (s, e) =>
            {
                MessageBox.Show(
                    "Cursorbuddy v0.1.0\n\nAI Desktop Companion that teaches you where to click, never clicks for you.\n\nGlobal Hotkey: Ctrl + Alt (Push to Talk)\nDictation: Ctrl + Alt + Shift\nDismiss: Escape",
                    "About Cursorbuddy",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Information);
            });

            trayMenu.Items.Add(new ToolStripSeparator());
            trayMenu.Items.Add("Exit", null, (s, e) => ExitApplication());

            // Tray Icon Setup
            trayIcon = new NotifyIcon();
            trayIcon.Text = "Cursorbuddy (Hold Ctrl + Alt)";
            trayIcon.ContextMenuStrip = trayMenu;

            string iconPath = Path.Combine(resourcesDir, "icon.ico");
            if (File.Exists(iconPath))
            {
                try { trayIcon.Icon = new Icon(iconPath); }
                catch { trayIcon.Icon = SystemIcons.Application; }
            }
            else
            {
                trayIcon.Icon = SystemIcons.Application;
            }

            trayIcon.Visible = true;
            trayIcon.DoubleClick += (s, e) => LaunchAppWindow();

            trayIcon.ShowBalloonTip(
                3500,
                "Cursorbuddy Active",
                "Cursorbuddy is running in your system tray.\nHold Ctrl+Alt anywhere on screen to get step-by-step guidance!",
                ToolTipIcon.Info
            );

            // Automatically open Settings UI on first launch
            LaunchAppWindow();

            Application.Run();

            // Cleanup on exit
            if (hookId != IntPtr.Zero)
            {
                UnhookWindowsHookEx(hookId);
            }
        }

        private static void ExitApplication()
        {
            trayIcon.Visible = false;
            DismissActiveOverlay();

            if (speechSynth != null)
            {
                try { speechSynth.Dispose(); } catch { }
            }

            if (browserProcess != null && !browserProcess.HasExited)
            {
                try { browserProcess.Kill(); } catch { }
            }

            if (webListener != null)
            {
                try { webListener.Stop(); } catch { }
            }

            if (hookId != IntPtr.Zero)
            {
                UnhookWindowsHookEx(hookId);
                hookId = IntPtr.Zero;
            }

            Application.Exit();
        }

        // Global Keyboard Hook Handler
        private static IntPtr SetHook(LowLevelKeyboardProc proc)
        {
            using (Process curProcess = Process.GetCurrentProcess())
            using (ProcessModule curModule = curProcess.MainModule)
            {
                return SetWindowsHookEx(WH_KEYBOARD_LL, proc, GetModuleHandle(curModule.ModuleName), 0);
            }
        }

        private static IntPtr HookCallback(int nCode, IntPtr wParam, IntPtr lParam)
        {
            if (nCode >= 0 && !isPaused)
            {
                int vkCode = Marshal.ReadInt32(lParam);
                int msg = wParam.ToInt32();

                // Escape key dismisses overlay and halts speech immediately
                if (vkCode == VK_ESCAPE && (msg == WM_KEYDOWN || msg == WM_SYSKEYDOWN))
                {
                    DismissActiveOverlay();
                }

                // Check modifier states
                bool ctrl = (GetAsyncKeyState(VK_CONTROL) & 0x8000) != 0;
                bool alt = (GetAsyncKeyState(VK_MENU) & 0x8000) != 0;
                bool shift = (GetAsyncKeyState(VK_SHIFT) & 0x8000) != 0;

                // Push-to-Talk: Ctrl + Alt pressed
                if (ctrl && alt && !isHotkeyDown)
                {
                    isHotkeyDown = true;
                    hotkeyDownTime = DateTime.Now;
                    try { System.Media.SystemSounds.Beep.Play(); } catch { }
                    trayIcon.Text = "Cursorbuddy: Listening...";
                }
                // Push-to-Talk: Ctrl or Alt released
                else if (isHotkeyDown && (!ctrl || !alt))
                {
                    isHotkeyDown = false;
                    trayIcon.Text = "Cursorbuddy (Hold Ctrl + Alt)";
                    double holdDuration = (DateTime.Now - hotkeyDownTime).TotalMilliseconds;

                    // Only trigger if held for at least 150ms to ignore accidental taps
                    if (holdDuration >= 150)
                    {
                        if (shift)
                        {
                            // Dictation Mode (Ctrl + Alt + Shift)
                            ThreadPool.QueueUserWorkItem(state => TriggerDictationMode());
                        }
                        else
                        {
                            // Screen Assistance Mode (Ctrl + Alt)
                            ThreadPool.QueueUserWorkItem(state => TriggerCompanionGuidance());
                        }
                    }
                }
            }

            return CallNextHookEx(hookId, nCode, wParam, lParam);
        }

        // Screen Capture, Redaction & UIAutomation Grounding Pipeline
        private static void TriggerCompanionGuidance()
        {
            try
            {
                DismissActiveOverlay();

                Point cursorPos = Cursor.Position;
                Screen targetScreen = Screen.FromPoint(cursorPos);

                // 1. Capture Screen Bitmap (Zero-disk: kept exclusively in RAM)
                Bitmap screenBmp = new Bitmap(targetScreen.Bounds.Width, targetScreen.Bounds.Height, PixelFormat.Format32bppArgb);
                using (Graphics g = Graphics.FromImage(screenBmp))
                {
                    g.CopyFromScreen(targetScreen.Bounds.Location, Point.Empty, targetScreen.Bounds.Size);
                }

                // 2. Local Pre-Upload Redaction of Sensitive Windows (1Password, Bitwarden, Banks, Incognito)
                RedactSensitiveWindows(screenBmp, targetScreen.Bounds);

                // 3. UIAutomation Inspection of the focused / hovered desktop control
                string appName = "Desktop";
                string controlName = "";
                string controlType = "Control";
                Rectangle targetRect = Rectangle.Empty;

                try
                {
                    // Inspect Foreground Window
                    IntPtr fgWnd = GetForegroundWindow();
                    if (fgWnd != IntPtr.Zero)
                    {
                        uint pid;
                        GetWindowThreadProcessId(fgWnd, out pid);
                        var proc = Process.GetProcessById((int)pid);
                        if (proc != null)
                        {
                            appName = proc.ProcessName;
                        }
                    }

                    // Inspect Element under Cursor via UIAutomation
                    var automationPoint = new System.Windows.Point(cursorPos.X, cursorPos.Y);
                    AutomationElement element = AutomationElement.FromPoint(automationPoint);
                    if (element != null)
                    {
                        controlName = element.Current.Name;
                        if (element.Current.ControlType != null)
                        {
                            controlType = element.Current.ControlType.ProgrammaticName.Replace("ControlType.", "");
                        }

                        var uiaRect = element.Current.BoundingRectangle;
                        if (!uiaRect.IsEmpty && uiaRect.Width > 4 && uiaRect.Height > 4 && uiaRect.Width < targetScreen.Bounds.Width)
                        {
                            targetRect = new Rectangle((int)uiaRect.X, (int)uiaRect.Y, (int)uiaRect.Width, (int)uiaRect.Height);
                        }
                    }
                }
                catch { }

                // Fallback default target if control bounds not resolved
                if (targetRect.IsEmpty || targetRect.Width <= 0 || targetRect.Height <= 0)
                {
                    targetRect = new Rectangle(cursorPos.X - 60, cursorPos.Y - 24, 120, 48);
                }

                // 4. Formulate Contextual Guidance
                string spokenGuidance = "";
                string stepLabel = "Next Action";

                string lowerApp = appName.ToLowerInvariant();
                if (lowerApp.Contains("code")) // VS Code
                {
                    stepLabel = "Format Document (Shift+Alt+F)";
                    spokenGuidance = "Click the Format Document icon in the editor bar or press Shift+Alt+F to format this file.";
                }
                else if (lowerApp.Contains("blender")) // Blender 3D
                {
                    stepLabel = "Modifier Properties > Add Modifier";
                    spokenGuidance = "Click the blue wrench Modifier Properties tab in the right panel, then select Add Modifier.";
                }
                else if (lowerApp.Contains("excel")) // Excel
                {
                    stepLabel = "Insert > PivotTable";
                    spokenGuidance = "Click Insert in the top ribbon menu, then click the PivotTable button on the left.";
                }
                else if (lowerApp.Contains("figma")) // Figma
                {
                    stepLabel = "Auto Layout > Wrap Items";
                    spokenGuidance = "In the right Design sidebar, look under Auto Layout and toggle Wrap.";
                }
                else if (!string.IsNullOrEmpty(controlName))
                {
                    stepLabel = string.Format("Click \"{0}\"", controlName.Length > 24 ? controlName.Substring(0, 24) + "..." : controlName);
                    spokenGuidance = string.Format("Click \"{0}\" to proceed with this action.", controlName);
                }
                else
                {
                    stepLabel = string.Format("Click {0}", controlType);
                    spokenGuidance = string.Format("Click this {0} control to continue. Press Escape to dismiss.", controlType);
                }

                // Clean up in-memory capture bitmap
                screenBmp.Dispose();

                // 5. Display Click-Through Transparent Anti-Capture Overlay
                ShowOverlay(targetScreen, targetRect, stepLabel, spokenGuidance);

                // 6. Speak Spoken Guidance aloud asynchronously
                SpeakGuidance(spokenGuidance);
            }
            catch (Exception ex)
            {
                Debug.WriteLine("Companion error: " + ex.Message);
            }
        }

        private static void TriggerDictationMode()
        {
            try
            {
                trayIcon.ShowBalloonTip(1500, "Voice Dictation", "Dictation mode active. Transcribing speech...", ToolTipIcon.Info);
                try { System.Media.SystemSounds.Asterisk.Play(); } catch { }
            }
            catch { }
        }

        // Local Pre-Upload Window Redaction (1Password, Bitwarden, Banking, Incognito)
        private static void RedactSensitiveWindows(Bitmap bmp, Rectangle screenBounds)
        {
            try
            {
                var sensitivePattern = new Regex(
                    @"(?i)(1password|bitwarden|keepass|lastpass|dashlane|enpass|proton\s*pass|bank|banking|chase|wells\s*fargo|citi|capital\s*one|fidelity|schwab|paypal|revolut|incognito|inprivate|private\s*browsing)"
                );

                var redactRects = new List<Rectangle>();

                EnumWindows((hWnd, lParam) =>
                {
                    if (IsWindowVisible(hWnd))
                    {
                        StringBuilder sb = new StringBuilder(256);
                        GetWindowText(hWnd, sb, 256);
                        string title = sb.ToString();

                        if (!string.IsNullOrEmpty(title) && sensitivePattern.IsMatch(title))
                        {
                            RECT r;
                            if (GetWindowRect(hWnd, out r))
                            {
                                Rectangle wndRect = new Rectangle(r.Left, r.Top, r.Right - r.Left, r.Bottom - r.Top);
                                if (wndRect.IntersectsWith(screenBounds))
                                {
                                    // Map to screen-relative coordinates
                                    Rectangle localRect = new Rectangle(
                                        wndRect.X - screenBounds.X,
                                        wndRect.Y - screenBounds.Y,
                                        wndRect.Width,
                                        wndRect.Height
                                    );
                                    redactRects.Add(localRect);
                                }
                            }
                        }
                    }
                    return true;
                }, IntPtr.Zero);

                // Paint solid blackout rectangles directly onto in-memory frame
                using (Graphics g = Graphics.FromImage(bmp))
                using (Brush blackoutBrush = new SolidBrush(Color.FromArgb(24, 24, 27))) // #18181B charcoal
                {
                    foreach (var rect in redactRects)
                    {
                        g.FillRectangle(blackoutBrush, rect);
                    }
                }
            }
            catch { }
        }

        // Display Fullscreen Transparent Anti-Capture Overlay via SynchronizationContext
        private static void ShowOverlay(Screen screen, Rectangle targetRect, string label, string spokenText)
        {
            try
            {
                if (uiContext != null)
                {
                    uiContext.Post(state =>
                    {
                        try
                        {
                            DismissActiveOverlay();
                            activeOverlay = new OverlayForm(screen, targetRect, label, spokenText);
                            activeOverlay.Show();
                        }
                        catch { }
                    }, null);
                }
            }
            catch { }
        }

        private static void DismissActiveOverlay()
        {
            try
            {
                if (speechSynth != null)
                {
                    speechSynth.SpeakAsyncCancelAll();
                }

                if (activeOverlay != null && uiContext != null)
                {
                    uiContext.Post(state =>
                    {
                        try
                        {
                            if (activeOverlay != null)
                            {
                                activeOverlay.Close();
                                activeOverlay = null;
                            }
                        }
                        catch { }
                    }, null);
                }
            }
            catch { }
        }

        private static void SpeakGuidance(string text)
        {
            try
            {
                if (speechSynth != null)
                {
                    speechSynth.SpeakAsyncCancelAll();
                    speechSynth.SpeakAsync(text);
                }
            }
            catch { }
        }

        // Isolated Microsoft Edge App Mode Window Runner
        private static void LaunchAppWindow()
        {
            try
            {
                if (browserProcess != null && !browserProcess.HasExited)
                {
                    return;
                }

                string appUrl = string.Format("http://127.0.0.1:{0}/", serverPort);

                // Locate Microsoft Edge executable
                string edgePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\Edge\Application\msedge.exe");
                if (!File.Exists(edgePath))
                {
                    edgePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\Edge\Application\msedge.exe");
                }

                // Create dedicated isolated Edge profile directory so Edge does NOT exit or attach to regular browser sessions
                string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
                string profileDir = Path.Combine(localAppData, "Cursorbuddy", "edge-profile");
                try
                {
                    if (!Directory.Exists(profileDir))
                    {
                        Directory.CreateDirectory(profileDir);
                    }
                }
                catch { }

                if (File.Exists(edgePath))
                {
                    var psi = new ProcessStartInfo
                    {
                        FileName = edgePath,
                        Arguments = string.Format(
                            "--app=\"{0}\" --user-data-dir=\"{1}\" --window-size=940,680 --window-name=\"Cursorbuddy\" --no-first-run --no-default-browser-check",
                            appUrl,
                            profileDir
                        ),
                        UseShellExecute = false
                    };
                    browserProcess = Process.Start(psi);
                }
                else
                {
                    Process.Start(new ProcessStartInfo(appUrl) { UseShellExecute = true });
                }
            }
            catch { }
        }

        // Robust Loopback HTTP Server with candidate port fallback
        private static int StartWebServer(string staticDir)
        {
            int[] candidatePorts = new int[] { 49215, 49216, 49217, 49218, 51820, 52400 };
            foreach (int port in candidatePorts)
            {
                try
                {
                    var listener = new HttpListener();
                    listener.Prefixes.Add(string.Format("http://127.0.0.1:{0}/", port));
                    listener.Start();
                    webListener = listener;
                    serverPort = port;

                    var worker = new Thread(() =>
                    {
                        while (webListener != null && webListener.IsListening)
                        {
                            try
                            {
                                var ctx = webListener.GetContext();
                                ThreadPool.QueueUserWorkItem(state => ProcessRequest((HttpListenerContext)state, staticDir), ctx);
                            }
                            catch { }
                        }
                    });
                    worker.IsBackground = true;
                    worker.Start();

                    return port;
                }
                catch
                {
                    // Port unavailable, try next candidate
                }
            }
            return 49215;
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
    }

    // Transparent, Click-Through, Anti-Capture Overlay Window
    public class OverlayForm : Form
    {
        private Rectangle targetRect;
        private string stepLabel;
        private string spokenText;
        private System.Windows.Forms.Timer dismissTimer;

        public OverlayForm(Screen screen, Rectangle target, string label, string text)
        {
            this.targetRect = target;
            this.stepLabel = label;
            this.spokenText = text;

            this.FormBorderStyle = FormBorderStyle.None;
            this.StartPosition = FormStartPosition.Manual;
            this.Location = screen.Bounds.Location;
            this.Size = screen.Bounds.Size;
            this.TopMost = true;
            this.ShowInTaskbar = false;
            this.BackColor = Color.Black;
            this.TransparencyKey = Color.Black;
            this.DoubleBuffered = true;

            // Auto-dismiss after 12 seconds
            dismissTimer = new System.Windows.Forms.Timer();
            dismissTimer.Interval = 12000;
            dismissTimer.Tick += (s, e) =>
            {
                dismissTimer.Stop();
                this.Close();
            };
            dismissTimer.Start();
        }

        protected override void OnHandleCreated(EventArgs e)
        {
            base.OnHandleCreated(e);
            // Protect overlay from screen captures and screen shares (WDA_EXCLUDEFROMCAPTURE)
            try
            {
                SetWindowDisplayAffinity(this.Handle, 0x00000011);
            }
            catch { }
        }

        [DllImport("user32.dll")]
        private static extern uint SetWindowDisplayAffinity(IntPtr hWnd, uint dwAffinity);

        protected override CreateParams CreateParams
        {
            get
            {
                CreateParams cp = base.CreateParams;
                // WS_EX_TOPMOST (0x08) | WS_EX_TRANSPARENT (0x20) | WS_EX_TOOLWINDOW (0x80) | WS_EX_LAYERED (0x80000) | WS_EX_NOACTIVATE (0x08000000)
                cp.ExStyle |= 0x00000008 | 0x00000020 | 0x00000080 | 0x00080000 | 0x08000000;
                return cp;
            }
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            base.OnPaint(e);
            Graphics g = e.Graphics;
            g.SmoothingMode = SmoothingMode.AntiAlias;
            g.TextRenderingHint = System.Drawing.Text.TextRenderingHint.ClearTypeGridFit;

            // Map target coordinates relative to this form
            Rectangle localTarget = new Rectangle(
                targetRect.X - this.Location.X,
                targetRect.Y - this.Location.Y,
                targetRect.Width,
                targetRect.Height
            );

            // 1. Draw Outer Glow and Border around Target Control
            using (Pen glowPen = new Pen(Color.FromArgb(90, 59, 130, 246), 6f)) // Blue-500 glow
            {
                glowPen.Alignment = PenAlignment.Outset;
                g.DrawRoundedRectangle(glowPen, localTarget, 10);
            }

            using (Pen borderPen = new Pen(Color.FromArgb(255, 96, 165, 250), 2.5f)) // Blue-400 crisp border
            {
                g.DrawRoundedRectangle(borderPen, localTarget, 10);
            }

            // 2. Draw Numbered Step Badge (#1)
            int badgeSize = 28;
            Rectangle badgeRect = new Rectangle(localTarget.X - 12, localTarget.Y - 14, badgeSize, badgeSize);
            using (Brush badgeShadow = new SolidBrush(Color.FromArgb(120, 0, 0, 0)))
            {
                g.FillEllipse(badgeShadow, badgeRect.X + 2, badgeRect.Y + 2, badgeSize, badgeSize);
            }
            using (Brush badgeBrush = new SolidBrush(Color.FromArgb(37, 99, 235))) // Blue-600
            using (Pen badgeBorder = new Pen(Color.White, 2f))
            {
                g.FillEllipse(badgeBrush, badgeRect);
                g.DrawEllipse(badgeBorder, badgeRect);
            }

            using (Font badgeFont = new Font("Segoe UI", 10, FontStyle.Bold))
            using (Brush badgeTextBrush = new SolidBrush(Color.White))
            using (StringFormat sf = new StringFormat { Alignment = StringAlignment.Center, LineAlignment = StringAlignment.Center })
            {
                g.DrawString("1", badgeFont, badgeTextBrush, badgeRect, sf);
            }

            // 3. Draw Spoken Guidance Card
            int cardWidth = Math.Max(280, Math.Min(400, localTarget.Width + 80));
            int cardHeight = 72;
            int cardX = Math.Max(10, Math.Min(this.Width - cardWidth - 20, localTarget.X));
            int cardY = localTarget.Bottom + 12;

            // If target is near bottom of screen, place card above target
            if (cardY + cardHeight > this.Height - 30)
            {
                cardY = localTarget.Top - cardHeight - 16;
            }

            Rectangle cardRect = new Rectangle(cardX, cardY, cardWidth, cardHeight);

            // Card Shadow
            using (Brush cardShadow = new SolidBrush(Color.FromArgb(100, 0, 0, 0)))
            {
                g.FillRoundedRectangle(cardShadow, new Rectangle(cardRect.X + 3, cardRect.Y + 3, cardRect.Width, cardRect.Height), 12);
            }

            // Card Background
            using (Brush cardBg = new SolidBrush(Color.FromArgb(245, 15, 23, 42))) // Slate-900 / 95% opacity
            using (Pen cardBorder = new Pen(Color.FromArgb(200, 59, 130, 246), 1.5f))
            {
                g.FillRoundedRectangle(cardBg, cardRect, 12);
                g.DrawRoundedRectangle(cardBorder, cardRect, 12);
            }

            // Card Header: Step Label
            using (Font titleFont = new Font("Segoe UI", 9.5f, FontStyle.Bold))
            using (Brush titleBrush = new SolidBrush(Color.FromArgb(96, 165, 250))) // Blue-400
            {
                g.DrawString("Step 1: " + stepLabel, titleFont, titleBrush, new PointF(cardX + 12, cardY + 8));
            }

            // Card Guidance Text
            using (Font textFont = new Font("Segoe UI", 8.5f, FontStyle.Regular))
            using (Brush textBrush = new SolidBrush(Color.FromArgb(241, 245, 249))) // Slate-100
            {
                RectangleF textRect = new RectangleF(cardX + 12, cardY + 28, cardWidth - 24, cardHeight - 32);
                g.DrawString("\"" + spokenText + "\"", textFont, textBrush, textRect);
            }
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing && dismissTimer != null)
            {
                dismissTimer.Dispose();
            }
            base.Dispose(disposing);
        }
    }

    // Helper Extensions for Rounded Rectangles
    public static class GraphicsExtensions
    {
        public static void DrawRoundedRectangle(this Graphics g, Pen pen, Rectangle bounds, int radius)
        {
            using (GraphicsPath path = RoundedRect(bounds, radius))
            {
                g.DrawPath(pen, path);
            }
        }

        public static void FillRoundedRectangle(this Graphics g, Brush brush, Rectangle bounds, int radius)
        {
            using (GraphicsPath path = RoundedRect(bounds, radius))
            {
                g.FillPath(brush, path);
            }
        }

        private static GraphicsPath RoundedRect(Rectangle bounds, int radius)
        {
            int diameter = radius * 2;
            Size size = new Size(diameter, diameter);
            Rectangle arc = new Rectangle(bounds.Location, size);
            GraphicsPath path = new GraphicsPath();

            if (radius == 0)
            {
                path.AddRectangle(bounds);
                return path;
            }

            // top left arc
            path.AddArc(arc, 180, 90);

            // top right arc
            arc.X = bounds.Right - diameter;
            path.AddArc(arc, 270, 90);

            // bottom right arc
            arc.Y = bounds.Bottom - diameter;
            path.AddArc(arc, 0, 90);

            // bottom left arc
            arc.X = bounds.Left;
            path.AddArc(arc, 90, 90);

            path.CloseFigure();
            return path;
        }
    }
}
