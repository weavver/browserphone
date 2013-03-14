using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.IO;
using SharpSvn;

namespace Weavver.Testing.Products
{
     public class BrowserPhone
     {
          [ManualTest]
          public void CreateRelease()
          {
               string buildLabel = TestingContext.BuildLabel;

               string buildDir = @"C:\Weavver\Builds\Testing\";
               string zipPath = buildDir + "Weavver-BrowserPhone-" + buildLabel.Replace(" ", "-") + ".zip";

               string tempFolder = Path.Combine(Path.GetTempPath(), "WeavverBrowserPhone");
               if (Directory.Exists(tempFolder))
                    Directory.Delete(tempFolder, true);
               Directory.CreateDirectory(tempFolder);

               string appBase = @"C:\Weavver\Main\Servers\web\c\Inetpub\www\Vendors\FreeSWITCH\FlexClient";
               Weavver.Utilities.Common.CopyFolder(appBase, tempFolder);

               System.Diagnostics.Process p = new System.Diagnostics.Process();
               p.StartInfo.FileName = @"C:\Weavver\Main\Projects\3rd Party\7-Zip\7z.exe";
               p.StartInfo.Arguments = "a " + zipPath + " *.* -r"; // +tempFolder;
               p.StartInfo.WorkingDirectory = tempFolder;
               p.Start();
               p.WaitForExit();

               Directory.Delete(tempFolder, true);
          }
     }
}