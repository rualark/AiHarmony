set pth=..\docs\prod

rmdir /s /q "%pth%"

robocopy /e /mir "..\js" "%pth%\js" *
robocopy /e /mir "..\img" "%pth%\img" *
robocopy /e /mir "..\css" "%pth%\css" *
robocopy /e /mir "..\plugin" "%pth%\plugin" * /XD UNUSED
xcopy /y ..\index.html "%pth%\"

