del /Q /F /S com.5e.hwinfo-reader.sdPlugin\logs\*
del /Q /F /S com.5e.hwinfo-reader.sdPlugin\bin\plugin.js.map
del /Q /F /S Release\*
DistributionTool.exe -b -i com.5e.hwinfo-reader.sdPlugin -o Release
pause