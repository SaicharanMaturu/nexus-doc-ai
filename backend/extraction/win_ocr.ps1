param([string]$ImagePath)

Add-Type -AssemblyName System.Runtime.WindowsRuntime

$asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { 
    $_.Name -eq 'AsTask' -and 
    $_.GetParameters().Count -eq 1 -and 
    $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' 
})[0]

function AwaitTask($WinRtTask, $ResultType) {
    $asTask = $asTaskGeneric.MakeGenericMethod($ResultType)
    $netTask = $asTask.Invoke($null, @($WinRtTask))
    $netTask.Wait(-1) | Out-Null
    return $netTask.Result
}

[Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime] | Out-Null
[Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType = WindowsRuntime] | Out-Null
[Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics.Imaging, ContentType = WindowsRuntime] | Out-Null

$resolvedPath = (Resolve-Path $ImagePath).Path
$fileStream = [System.IO.File]::OpenRead($resolvedPath)
$stream = [System.IO.WindowsRuntimeStreamExtensions]::AsRandomAccessStream($fileStream)
$decoder = AwaitTask ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
$bitmap = AwaitTask ($decoder.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])

$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
if ($null -eq $engine) {
    $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage([Windows.Globalization.Language]::new('en-US'))
}

$ocrResult = AwaitTask ($engine.RecognizeAsync($bitmap)) ([Windows.Media.Ocr.OcrResult])

$out = @{
    Text = $ocrResult.Text
    Lines = @()
}

foreach ($line in $ocrResult.Lines) {
    $words = @()
    foreach ($w in $line.Words) {
        $words += @{
            Text = $w.Text
            X = $w.BoundingRect.X
            Y = $w.BoundingRect.Y
            Width = $w.BoundingRect.Width
            Height = $w.BoundingRect.Height
        }
    }
    $out.Lines += @{
        Text = $line.Text
        Words = $words
    }
}

$out | ConvertTo-Json -Depth 6
