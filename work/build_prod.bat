set pth=..\docs\prod

rem rmdir /s /q "%pth%"

robocopy /e /mir "..\js" "%pth%\js" *
robocopy /e /mir "..\img" "%pth%\img" *
robocopy /e /mir "..\md" "%pth%\md" *
robocopy /e /mir "..\lib" "%pth%\lib" *
robocopy /e /mir "..\template" "%pth%\template" *
robocopy /e /mir "..\ico" "%pth%\ico" *
robocopy /e /mir "..\test_data" "%pth%\test_data" *
robocopy /e /mir "..\css" "%pth%\css" *
robocopy /e /mir "..\musicxml" "%pth%\musicxml" *
robocopy /e /mir "..\plugin" "%pth%\plugin" * /XD UNUSED
xcopy /y ..\*.html "%pth%\"
xcopy /y ..\*.php "%pth%\"
xcopy /y ..\manifest.json "%pth%\"
