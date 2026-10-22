$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8000/")
$listener.Start()
Write-Host "Nest Real Estate local web server is running on http://localhost:8000/ ..."

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $path = $request.Url.LocalPath
        if ($path -eq "/") {
            $path = "/index.html"
        }
        
        $filePath = Join-Path $PSScriptRoot $path.TrimStart('/')
        
        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            
            if ($ext -eq ".html") {
                $response.ContentType = "text/html; charset=utf-8"
            } elseif ($ext -eq ".css") {
                $response.ContentType = "text/css"
            } elseif ($ext -eq ".js") {
                $response.ContentType = "application/javascript"
            } elseif ($ext -eq ".png") {
                $response.ContentType = "image/png"
            } elseif ($ext -eq ".jpg" -or $ext -eq ".jpeg") {
                $response.ContentType = "image/jpeg"
            }
            
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
        }
        $response.Close()
    } catch {
        # Connection drop protection
    }
}
