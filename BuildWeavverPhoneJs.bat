mkdir build
java -jar vendors\google-closure-compiler\compiler.jar ^
     --js=src\swfobject.js ^
     --js=src\jquery-1.8.3.min.js ^
     --js=src\jquery.tmpl.js ^
     --js=src\jquery-ui-1.9.2.custom.min.js ^
     --js=src\WeavverPhoneLib.js ^
     --js_output_file=build\WeavverPhone.js

java -jar vendors\google-closure-compiler\compiler.jar ^
     --js=src\swfobject.js ^
     --js=src\WeavverPhoneLib.js ^
     --js_output_file=build\WeavverPhone.withoutjquery.js

xcopy "src/images" "build/images" /I /E /Y
copy "src\WeavverBrowserPhone.swf" "build\WeavverBrowserPhone.swf"
copy "src\WeavverPhone.tpl.html" "build\WeavverPhone.tpl.html"
copy "src\jquery-ui-1.9.2.custom.min.css" "build\jquery-ui.1.9.2.custom.min.css"