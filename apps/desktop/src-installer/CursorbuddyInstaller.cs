using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.IO.Compression;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Threading;
using System.Windows.Forms;
using Microsoft.Win32;

namespace CursorbuddyInstaller
{
    public class InstallerForm : Form
    {
        private ProgressBar progressBar;
        private Label statusLabel;
        private Label titleLabel;

        public InstallerForm()
        {
            this.Text = "Cursorbuddy Setup";
            this.Size = new Size(480, 260);
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.StartPosition = FormStartPosition.CenterScreen;
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.BackColor = Color.FromArgb(15, 23, 42); // slate-900
            this.ForeColor = Color.White;

            string iconPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "icon.ico");
            if (File.Exists(iconPath))
            {
                this.Icon = new Icon(iconPath);
            }

            titleLabel = new Label
            {
                Text = "Installing Cursorbuddy",
                Font = new Font("Segoe UI", 16, FontStyle.Bold),
                ForeColor = Color.White,
                Location = new Point(30, 30),
                AutoSize = true
            };
            this.Controls.Add(titleLabel);

            var subtitle = new Label
            {
                Text = "AI Desktop Companion that teaches, never clicks",
                Font = new Font("Segoe UI", 9),
                ForeColor = Color.FromArgb(148, 163, 184), // slate-400
                Location = new Point(32, 65),
                AutoSize = true
            };
            this.Controls.Add(subtitle);

            progressBar = new ProgressBar
            {
                Location = new Point(32, 110),
                Size = new Size(400, 18),
                Style = ProgressBarStyle.Continuous,
                Value = 10
            };
            this.Controls.Add(progressBar);

            statusLabel = new Label
            {
                Text = "Extracting application files...",
                Font = new Font("Segoe UI", 9),
                ForeColor = Color.FromArgb(96, 165, 250), // blue-400
                Location = new Point(32, 140),
                Size = new Size(400, 25)
            };
            this.Controls.Add(statusLabel);

            this.Shown += (s, e) =>
            {
                var thread = new Thread(PerformInstall);
                thread.IsBackground = true;
                thread.Start();
            };
        }

        private void PerformInstall()
        {
            try
            {
                UpdateProgress(25, "Preparing destination directory...");
                Thread.Sleep(300);

                string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
                string installDir = Path.Combine(localAppData, "Programs", "Cursorbuddy");

                if (!Directory.Exists(installDir))
                {
                    Directory.CreateDirectory(installDir);
                }

                UpdateProgress(50, "Unpacking Cursorbuddy binaries and webview assets...");
                Thread.Sleep(300);

                // Extract embedded payload.zip resource
                var assembly = Assembly.GetExecutingAssembly();
                using (var stream = assembly.GetManifestResourceStream("payload.zip"))
                {
                    if (stream != null)
                    {
                        using (var archive = new ZipArchive(stream))
                        {
                            foreach (var entry in archive.Entries)
                            {
                                string targetPath = Path.Combine(installDir, entry.FullName);
                                string targetDir = Path.GetDirectoryName(targetPath);
                                if (!Directory.Exists(targetDir))
                                {
                                    Directory.CreateDirectory(targetDir);
                                }
                                if (!string.IsNullOrEmpty(entry.Name))
                                {
                                    entry.ExtractToFile(targetPath, true);
                                }
                            }
                        }
                    }
                }

                UpdateProgress(75, "Creating desktop & start menu shortcuts...");
                Thread.Sleep(300);

                string exePath = Path.Combine(installDir, "Cursorbuddy.exe");
                string icoPath = Path.Combine(installDir, "resources", "icon.ico");

                // Create Desktop Shortcut
                string desktopDir = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
                CreateShortcut(Path.Combine(desktopDir, "Cursorbuddy.lnk"), exePath, icoPath, "Cursorbuddy AI Companion");

                // Create Start Menu Shortcut
                string startMenuDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), @"Microsoft\Windows\Start Menu\Programs");
                CreateShortcut(Path.Combine(startMenuDir, "Cursorbuddy.lnk"), exePath, icoPath, "Cursorbuddy AI Companion");

                UpdateProgress(90, "Registering in Windows Programs & Features...");
                RegisterUninstall(installDir, exePath, icoPath);

                UpdateProgress(100, "Installation complete! Launching Cursorbuddy...");
                Thread.Sleep(400);

                // Launch installed application
                if (File.Exists(exePath))
                {
                    Process.Start(new ProcessStartInfo(exePath) { WorkingDirectory = installDir });
                }

                this.Invoke((MethodInvoker)delegate
                {
                    this.Close();
                });
            }
            catch (Exception ex)
            {
                MessageBox.Show("Installation failed: " + ex.Message, "Cursorbuddy Setup Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                this.Invoke((MethodInvoker)delegate { this.Close(); });
            }
        }

        private void UpdateProgress(int value, string message)
        {
            if (this.InvokeRequired)
            {
                this.Invoke((MethodInvoker)delegate { UpdateProgress(value, message); });
                return;
            }
            progressBar.Value = Math.Min(100, value);
            statusLabel.Text = message;
        }

        private static void CreateShortcut(string shortcutPath, string targetPath, string iconPath, string description)
        {
            try
            {
                Type shellType = Type.GetTypeFromProgID("WScript.Shell");
                dynamic shell = Activator.CreateInstance(shellType);
                dynamic shortcut = shell.CreateShortcut(shortcutPath);
                shortcut.TargetPath = targetPath;
                shortcut.WorkingDirectory = Path.GetDirectoryName(targetPath);
                shortcut.Description = description;
                if (File.Exists(iconPath))
                {
                    shortcut.IconLocation = iconPath + ",0";
                }
                shortcut.Save();
            }
            catch
            {
                // Fallback: non-fatal if shortcut creation blocked by group policy
            }
        }

        private static void RegisterUninstall(string installDir, string exePath, string iconPath)
        {
            try
            {
                using (var key = Registry.CurrentUser.CreateSubKey(@"Software\Microsoft\Windows\CurrentVersion\Uninstall\Cursorbuddy"))
                {
                    if (key != null)
                    {
                        key.SetValue("DisplayName", "Cursorbuddy");
                        key.SetValue("DisplayVersion", "0.1.0");
                        key.SetValue("Publisher", "Cursorbuddy Contributors");
                        key.SetValue("InstallLocation", installDir);
                        key.SetValue("DisplayIcon", iconPath);
                        key.SetValue("UninstallString", string.Format("cmd.exe /c rd /s /q \"{0}\" & reg delete \"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Cursorbuddy\" /f", installDir));
                        key.SetValue("NoModify", 1, RegistryValueKind.DWord);
                        key.SetValue("NoRepair", 1, RegistryValueKind.DWord);
                    }
                }
            }
            catch { }
        }
    }

    static class Program
    {
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new InstallerForm());
        }
    }
}
