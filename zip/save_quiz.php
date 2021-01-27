<?php
// Stay chill and don't use PHP. Don't ask. Just don't.

// Get questions content.
$data = $_POST['json'];

// URL where to store edited otazky.json.
$url = $_SERVER['DOCUMENT_ROOT'].'/zip/js/otazky.json';

// Save data into $url.
$file = fopen($url, 'w');
fwrite($file, $data);
fclose($file);

// Create zip containing the /zip directory.
$dir = 'zip/';
$zipname = 'site.zip';

// Find all files.
$files = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($dir),
    RecursiveIteratorIterator::SELF_FIRST
);

// Create the archive.
$zip = new ZipArchive;
if ($zip -> open($zipname, ZipArchive::CREATE))
{
    foreach ($files as $file) {

        // . and .. folders, out you go!
        if (in_array(substr($file, strrpos($file, '/') + 1), array('.', '..')))
            continue;

        if (is_dir($file))
        {
            $zip -> addEmptyDir(str_replace($dir.'/', '', $file.'/'));
        }
        else if (is_file($file))
        {
            $zip -> addFromString(
                str_replace($dir.'/', '', $file), file_get_contents($file));
        }
    }
    $zip -> close();

    // Prompt the user to download the file.
    if (file_exists($zipname))
    {
        // Creates headers for the "Chrome" type of browsers. No offense.
        header('Content-Description: File Transfer');
        header('Content-Type: application/zip');
        header('Content-Disposition: attachment; filename='.basename($zipname));
        header('Content-Transfer-Encoding: binary');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');

        ob_clean();
        flush();

        // All done. Bye, bye.
        die();
    }
}
?>