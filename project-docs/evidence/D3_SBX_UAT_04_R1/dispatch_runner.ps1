Add-Type -ReferencedAssemblies "System.Drawing", "System.Windows.Forms" @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Threading;
using System.Windows.Forms;
using System.Runtime.InteropServices;

public class UatRunner {
    [DllImport("user32.dll")]
    public static extern IntPtr OpenWindowStation(string lpszWinSta, bool fInherit, uint dwDesiredAccess);

    [DllImport("user32.dll")]
    public static extern bool SetProcessWindowStation(IntPtr hWinSta);

    [DllImport("user32.dll")]
    public static extern IntPtr OpenDesktop(string lpszDesktop, uint dwFlags, bool fInherit, uint dwDesiredAccess);

    [DllImport("user32.dll")]
    public static extern bool SetThreadDesktop(IntPtr hDesktop);

    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

    [DllImport("user32.dll")]
    public static extern bool BringWindowToTop(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);

    [DllImport("kernel32.dll")]
    public static extern uint GetCurrentThreadId();

    [DllImport("user32.dll", SetLastError = true)]
    public static extern bool AttachThreadInput(uint idAttach, uint idAttachTo, bool fAttach);

    [DllImport("user32.dll")]
    public static extern bool SetCursorPos(int X, int Y);

    [DllImport("user32.dll")]
    public static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint dwData, UIntPtr dwExtraInfo);

    [DllImport("user32.dll")]
    public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);

    [DllImport("user32.dll")]
    public static extern IntPtr GetDesktopWindow();

    [DllImport("user32.dll")]
    public static extern IntPtr GetWindowDC(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern IntPtr ReleaseDC(IntPtr hWnd, IntPtr hDC);

    [DllImport("gdi32.dll")]
    public static extern bool BitBlt(IntPtr hObject, int nXDest, int nYDest,
        int nWidth, int nHeight, IntPtr hObjectSource,
        int nXSrc, int nYSrc, int dwRop);

    [DllImport("user32.dll")]
    public static extern int GetSystemMetrics(int nIndex);

    const uint MOUSEEVENTF_LEFTDOWN = 0x0002;
    const uint MOUSEEVENTF_LEFTUP = 0x0004;
    const byte VK_ESCAPE = 0x1B;
    const byte VK_CONTROL = 0x11;
    const byte VK_A = 0x41;
    const byte VK_V = 0x56;
    const byte VK_DELETE = 0x2E;
    const byte VK_RETURN = 0x0D;
    const uint KEYEVENTF_KEYUP = 0x0002;
    const int SW_MAXIMIZE = 3;
    const int SRCCOPY = 0x00CC0020;

    public static void Click(int x, int y) {
        SetCursorPos(x, y);
        Thread.Sleep(80);
        mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, UIntPtr.Zero);
        Thread.Sleep(60);
        mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, UIntPtr.Zero);
        Thread.Sleep(150);
    }

    public static void SendKey(byte vk) {
        keybd_event(vk, 0, 0, UIntPtr.Zero);
        Thread.Sleep(50);
        keybd_event(vk, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
        Thread.Sleep(100);
    }

    public static void SendCtrlKey(byte vk) {
        keybd_event(VK_CONTROL, 0, 0, UIntPtr.Zero);
        Thread.Sleep(50);
        keybd_event(vk, 0, 0, UIntPtr.Zero);
        Thread.Sleep(80);
        keybd_event(vk, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
        keybd_event(VK_CONTROL, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
        Thread.Sleep(150);
    }

    public static string DispatchConsole(IntPtr hWnd, string jsCode, string screenshotPath, int waitMs) {
        string status = "";
        Thread t = new Thread(() => {
            IntPtr hWinSta = OpenWindowStation("WinSta0", false, 0x037F);
            if (hWinSta != IntPtr.Zero) SetProcessWindowStation(hWinSta);
            IntPtr hDesk = OpenDesktop("Default", 0, false, 0x01FF);
            if (hDesk == IntPtr.Zero) {
                status = "ERROR: Failed to open desktop";
                return;
            }
            SetThreadDesktop(hDesk);

            ShowWindow(hWnd, SW_MAXIMIZE);
            BringWindowToTop(hWnd);
            SetForegroundWindow(hWnd);
            Thread.Sleep(300);

            uint pid;
            uint targetTid = GetWindowThreadProcessId(hWnd, out pid);
            uint curTid = GetCurrentThreadId();

            AttachThreadInput(curTid, targetTid, true);
            SetForegroundWindow(hWnd);
            Thread.Sleep(200);

            // Dismiss any active popup
            SendKey(VK_ESCAPE);
            Thread.Sleep(200);

            // Focus Console prompt at (1650, 1145)
            Click(1650, 1145);
            Thread.Sleep(200);

            // Select all & clear prompt
            SendCtrlKey(VK_A);
            SendKey(VK_DELETE);
            Thread.Sleep(100);

            // Set clipboard verbatim
            Clipboard.SetText(jsCode);
            Thread.Sleep(100);

            // Paste and execute
            SendCtrlKey(VK_V);
            Thread.Sleep(150);
            SendKey(VK_RETURN);

            // Wait for execution / download
            Thread.Sleep(waitMs);

            AttachThreadInput(curTid, targetTid, false);

            // Capture screenshot
            int width = GetSystemMetrics(0);
            int height = GetSystemMetrics(1);
            IntPtr hDeskWnd = GetDesktopWindow();
            IntPtr hdcSrc = GetWindowDC(hDeskWnd);

            using (Bitmap bmp = new Bitmap(width, height)) {
                using (Graphics g = Graphics.FromImage(bmp)) {
                    IntPtr hdcDest = g.GetHdc();
                    try {
                        BitBlt(hdcDest, 0, 0, width, height, hdcSrc, 0, 0, SRCCOPY);
                    } finally {
                        g.ReleaseHdc(hdcDest);
                    }
                }
                ReleaseDC(hDeskWnd, hdcSrc);
                bmp.Save(screenshotPath, ImageFormat.Png);
            }
            status = "SUCCESS";
        });
        t.SetApartmentState(ApartmentState.STA);
        t.Start();
        t.Join();
        return status;
    }
}
"@

$Action = $args[0]
if (-not $Action) {
    Write-Error "Action argument required: Get1 | Client | Get2"
    exit 1
}

$evidenceDir = "C:\Users\allda\Desktop\Dev\git\MBO2026\project-docs\evidence\D3_SBX_UAT_04_R1"
$scratch = "C:\Users\allda\.gemini\antigravity-cli\brain\468b7e0f-92f7-461a-9b38-f5d749e52ce1\scratch"
$targetHwnd = [IntPtr]0x130EBA

if ($Action -eq "Get1") {
    $scriptPath = "$evidenceDir\capture_get1.js"
    $expectedDigest = "0bffbf7c91e968662164778b7a1404d1a79f1bf7883b614430bae4c602843fd3"
    $downloadTarget = "C:\Users\allda\Downloads\uat04_r1_get1_record.json"
    $downloadError = "C:\Users\allda\Downloads\uat04_r1_get1_error.json"
    $screenCapture = "$scratch\uat04_r1_get1_screen.png"
    $capturedDest = "$scratch\raw_uat04_r1_get1_record.json"

    if (Test-Path $downloadTarget) { Remove-Item $downloadTarget -Force }
    if (Test-Path $downloadError) { Remove-Item $downloadError -Force }

    $js = [System.IO.File]::ReadAllText($scriptPath, [System.Text.Encoding]::UTF8)
    $actualHash = (Get-FileHash -Path $scriptPath -Algorithm SHA256).Hash.ToLower()
    if ($actualHash -ne $expectedDigest) {
        Write-Error "PREFLIGHT INTEGRITY ERROR: capture_get1.js digest mismatch ($actualHash != $expectedDigest)"
        exit 1
    }

    $preDispatchUtc = (Get-Date).ToUniversalTime().ToString("o")
    Write-Output "RECORDING_BEFORE_DISPATCH: ATTEMPT=1, ENDPOINT=/k/v1/record.json?app=794&id=15, PRE_UTC=$preDispatchUtc"

    $res = [UatRunner]::DispatchConsole($targetHwnd, $js, $screenCapture, 3500)
    Write-Output "DispatchResult: $res"

    if (Test-Path $downloadTarget) {
        Copy-Item $downloadTarget $capturedDest -Force
        Write-Output "GET1_CAPTURED_SUCCESS: $capturedDest"
        Get-Item $capturedDest | Select-Object Name, Length, LastWriteTime | Format-List
    } elseif (Test-Path $downloadError) {
        Copy-Item $downloadError "$scratch\raw_uat04_r1_get1_error.json" -Force
        Write-Output "GET1_CAPTURED_ERROR: $scratch\raw_uat04_r1_get1_error.json"
    } else {
        Write-Output "GET1_DOWNLOAD_FILE_MISSING"
    }
}
elseif ($Action -eq "Client") {
    $scriptPath = "$evidenceDir\capture_client.js"
    $expectedDigest = "34e679eb5635519c73332839046f2ff378ad35367f6d78c2314bf2269f17113a"
    $downloadTarget = "C:\Users\allda\Downloads\uat04_r1_client_record.json"
    $downloadError = "C:\Users\allda\Downloads\uat04_r1_client_error.json"
    $screenCapture = "$scratch\uat04_r1_client_screen.png"
    $capturedDest = "$scratch\raw_uat04_r1_client_record.json"

    if (Test-Path $downloadTarget) { Remove-Item $downloadTarget -Force }
    if (Test-Path $downloadError) { Remove-Item $downloadError -Force }

    $js = [System.IO.File]::ReadAllText($scriptPath, [System.Text.Encoding]::UTF8)
    $actualHash = (Get-FileHash -Path $scriptPath -Algorithm SHA256).Hash.ToLower()
    if ($actualHash -ne $expectedDigest) {
        Write-Error "PREFLIGHT INTEGRITY ERROR: capture_client.js digest mismatch ($actualHash != $expectedDigest)"
        exit 1
    }

    $preDispatchUtc = (Get-Date).ToUniversalTime().ToString("o")
    Write-Output "RECORDING_CLIENT_IN_MEMORY_CAPTURE: SOURCE=kintone.app.record.get(), PRE_UTC=$preDispatchUtc"

    $res = [UatRunner]::DispatchConsole($targetHwnd, $js, $screenCapture, 2500)
    Write-Output "DispatchResult: $res"

    if (Test-Path $downloadTarget) {
        Copy-Item $downloadTarget $capturedDest -Force
        Write-Output "CLIENT_CAPTURED_SUCCESS: $capturedDest"
        Get-Item $capturedDest | Select-Object Name, Length, LastWriteTime | Format-List
    } elseif (Test-Path $downloadError) {
        Copy-Item $downloadError "$scratch\raw_uat04_r1_client_error.json" -Force
        Write-Output "CLIENT_CAPTURED_ERROR: $scratch\raw_uat04_r1_client_error.json"
    } else {
        Write-Output "CLIENT_DOWNLOAD_FILE_MISSING"
    }
}
elseif ($Action -eq "Get2") {
    $scriptPath = "$evidenceDir\capture_get2.js"
    $expectedDigest = "7bb6c989779e7f52e90c2fd3a6906875c1c0f8639b6a0dc319c96ca32e495ca8"
    $downloadTarget = "C:\Users\allda\Downloads\uat04_r1_get2_record.json"
    $downloadError = "C:\Users\allda\Downloads\uat04_r1_get2_error.json"
    $screenCapture = "$scratch\uat04_r1_get2_screen.png"
    $capturedDest = "$scratch\raw_uat04_r1_get2_record.json"

    if (Test-Path $downloadTarget) { Remove-Item $downloadTarget -Force }
    if (Test-Path $downloadError) { Remove-Item $downloadError -Force }

    $js = [System.IO.File]::ReadAllText($scriptPath, [System.Text.Encoding]::UTF8)
    $actualHash = (Get-FileHash -Path $scriptPath -Algorithm SHA256).Hash.ToLower()
    if ($actualHash -ne $expectedDigest) {
        Write-Error "PREFLIGHT INTEGRITY ERROR: capture_get2.js digest mismatch ($actualHash != $expectedDigest)"
        exit 1
    }

    $preDispatchUtc = (Get-Date).ToUniversalTime().ToString("o")
    Write-Output "RECORDING_BEFORE_DISPATCH: ATTEMPT=2, ENDPOINT=/k/v1/record.json?app=794&id=15, PRE_UTC=$preDispatchUtc"

    $res = [UatRunner]::DispatchConsole($targetHwnd, $js, $screenCapture, 3500)
    Write-Output "DispatchResult: $res"

    if (Test-Path $downloadTarget) {
        Copy-Item $downloadTarget $capturedDest -Force
        Write-Output "GET2_CAPTURED_SUCCESS: $capturedDest"
        Get-Item $capturedDest | Select-Object Name, Length, LastWriteTime | Format-List
    } elseif (Test-Path $downloadError) {
        Copy-Item $downloadError "$scratch\raw_uat04_r1_get2_error.json" -Force
        Write-Output "GET2_CAPTURED_ERROR: $scratch\raw_uat04_r1_get2_error.json"
    } else {
        Write-Output "GET2_DOWNLOAD_FILE_MISSING"
    }
}
else {
    Write-Error "Unknown action: $Action"
    exit 1
}
