@echo off
setlocal enabledelayedexpansion

rem ---------------------------------------------------------
rem 构建发布脚本
rem @author lrh@gmail.com
rem ---------------------------------------------------------

cd /d %~dp0
set input=%1
set projectPath=%~dp0
set configPath=.\assets\TRFrameWork\ThirdSDK\cocos-multi-platform\AdConfig.json
set buildPath=.\build
set settingsPath=.\settings
set localPath=.\local
set releasePath=E:\work\Sea\Programmes\Projects\TowerRelease
set time=0
set RAR="C:\Program Files\WinRAR\Rar.exe"
set ZIP="E:\work\setup\zip.exe"
set COCOS="C:\ProgramData\cocos\editors\Creator\2.4.11\CocosCreator.exe"

set startScene="0e3b81a3-653c-4f4f-b848-529ecae21a31"

rem 平台类型 0web 1抖音平台 2微信平台 3快手平台 4sec平台 5B站平台 6百度平台
set platTypeWeb=0
set platTypeDy=1
set platTypeWx=2
set platTypeKs=3
set platTypeSec=4
set platTypeBl=5
set platTypeBd=6

rem ---------------------------------------------------------
if "%input%" == "" goto fun_wait_input
goto fun_run

rem -----------------公共函数----------------------------------------
:fun_wait_input
    set input=
    echo.
    echo ==============================
	echo dy_0: 		构建抖音
	echo wechat_1: 	构建微信
	echo ks_2: 		构建快手
	echo bili_3: 	构建bili
	echo sec_4: 		构建sec
	echo baidu_5: 	构建baidu
	echo web:  		构建web
	echo.
	echo clean_dy: 	清理抖音
	echo clean_wechat: 	清理微信
	echo clean_ks: 	清理快手
	echo clean_web: 	清理web
	echo time:		当前时间
    echo quit:  		结束运行
    echo ------------------------------
    set /p input=请输入指令:
    echo ------------------------------
	goto fun_run
	
:wait_input
    rem 区分是否带有命令行参数
    if [%1]==[] goto fun_wait_input
    goto end

:fun_run
	if [%input%]==[dy_0] goto fun_build_dy_0
	if [%input%]==[wechat_1] goto fun_build_wechat_1
	if [%input%]==[ks_2] goto fun_build_ks_2
	if [%input%]==[bili_3] goto fun_build_bili_3
	if [%input%]==[sec_4] goto fun_build_sec_4
	if [%input%]==[baidu_5] goto fun_build_baidu_5
	if [%input%]==[web] goto fun_build_web
	
	if [%input%]==[clean_dy] goto fun_clean_dy
	if [%input%]==[clean_wechat] goto fun_clean_wechat
	if [%input%]==[clean_ks] goto fun_clean_ks
	if [%input%]==[clean_web] goto fun_clean_web
	if [%input%]==[time] goto fun_gettime
    if [%input%]==[quit] goto end
    goto wait_input
	
rem ---------------内部函数------------------------------------------	
:fun_build
	cd %projectPath%
	set debug=false
	set actualPlatform=%1
	set platName=%2
	set settingsName=%3
	set appid=%4
	set buildName=%5
	set remoteRoot=%6
	set currPlatform=%7
	set fileName=%8
	set ver=%9
	shift /1
	set platType=%9
	shift /1
	set appsecrect=%9
	shift /1
	set RewardVideo=%9
	shift /1
	set Interstitial=%9
	shift /1
	set Banner=%9
	shift /1
	set gameVer=%9
	shift /1
	set svnVer=%9
	shift /1
	set GameName=%9
	
	
	set inlineSpriteFrames=true
	set orientation=portrait
	
	call :fun_modify_AdConfig %currPlatform% %platType% %appid% %appsecrect% %RewardVideo% %Interstitial% %Banner% %gameVer% %svnVer% %GameName%
	call :fun_create_local %actualPlatform% %platName% %buildPath%
	
	mkdir %buildPath%\%buildName%
	if %platType% NEQ %platTypeWeb% (
		if %platType% NEQ %platTypeSec% (
			call :fun_create_settings %settingsName% %appid% %remoteRoot%
		)
	)

	%COCOS% --path %projectPath% --build "buildPath=%buildPath%; platform=%actualPlatform%; debug=%debug%; sourceMaps=true; inlineSpriteFrames=%inlineSpriteFrames%; orientation=%orientation%; startScene=%startScene%;autoCompile=true;md5Cache=true"
	
	if %platType% NEQ %platTypeWeb% (
		if %platType% NEQ %platTypeSec% (
			copy %buildPath%\index.js %buildPath%\%buildName%\index.js
			if %platType% EQU %platTypeBl% (
				call :fun_modify_gamejs_bili %buildName%
				call :fun_bili_extra %appid% %buildName% %ver%
			) else (
				call :fun_modify_gamejs %buildName%
			)
			call :fun_create_release %appid% %buildName% %fileName% %platType%
		) else (
			rem call :fun_modify_index
			call :fun_create_web_release %appid% %buildName% %fileName%
		)
	) else (
		call :fun_create_web_release %appid% %buildName% %fileName%
	)

	echo.
	echo.
	echo fileName:%fileName%
	echo.
	echo.
	
	exit /b
	
:fun_modify_AdConfig
	chcp 65001 > nul
	set currPlatform=%1
	set platType=%2
	set appid=%3
	set appsecrect=%4
	set RewardVideos=%5
	set Interstitials=%6
	set Banners=%7
	set gameVer=%8
	set svnVer=%9
	shift /1
	set GameName=%9
	set tmpPath=.\tempAdConfig.json

	(
		rem setlocal enabledelayedexpansion
		echo {
		echo "GameName": %GameName%,
			
		echo "Banner": [
		for %%a in (%Banners%) do (
			echo {"id": %%a, "interval": 30}
		)
		echo ],

		rem set "count=0"
		rem for /f "delims=-" %%a in ("%RewardVideos%") do (
		rem 	set /a count+=1
		rem )
		rem echo "RewardVideo": [
		rem set "index=0"
		rem for /f "delims=-" %%a in ("%RewardVideos%") do (
		rem 	set /a index+=1
		rem 	if "!index!"=="%count%" (
		rem 		echo %%a,
		rem 	) else (
		rem 		echo %%a
		rem 	)
		rem )
		rem echo ],
		
		echo "RewardVideos": [
		for %%a in (%RewardVideos%) do (
			echo %%a
		)
		echo ],
		
		
		echo "Interstitial": [
		for %%a in (%Interstitials%) do (
			echo %%a
		)
		echo ],
		
		echo "AppId": "%appid%",
		echo "AppSecrect": "%appsecrect%",
		echo "platform": %currPlatform%,
		echo "platformType": %platType%,
		echo "gameVer": %gameVer%,
		echo "svnVer": %svnVer%
		echo }
		rem endlocal
	) >> %tmpPath%
	move /y %tmpPath% %configPath%
	
	chcp 936 > nul
	exit /b
	
:fun_modify_gamejs
	chcp 65001 > nul
	set buildName=%1
	set gamejsPath=%buildPath%\%buildName%\game.js
	set tmpPath=%buildPath%\%buildName%\tempfile.js
	set "f=%gamejsPath%"
	set line_number=2
	set /a counter=0
	set "newContent=require('./index');"
	(for /f "delims=" %%a in (%gamejsPath%) do (
		set "line=%%a"
		set /a counter+=1
		setlocal enabledelayedexpansion
		if !counter! equ %line_number% (
			echo !line!
			echo.
			echo !newContent!
			echo.
		) else (
			echo !line!
			echo.
		)
		endlocal
	) >> %tmpPath%
	)
	move /y %tmpPath% %gamejsPath%
	
	chcp 936 > nul
	exit /b
	
:fun_modify_gamejs_bili
	chcp 65001 > nul
	set buildName=%1
	set gamejsPath=%buildPath%\%buildName%\game.js
	set tmpPath=%buildPath%\%buildName%\tempfile.js
	set "f=%gamejsPath%"
	set line_number=2
	set /a counter=0
	set "newContent1=require('./index');";
	set "newContent2=require('blapp-adapter-v2.4-cocos.js');";
	set "content=window.boot";
	set "newContent3=window.boot();";
	set "newContent4=if(bl){bl.launchSuccess()};";
	(for /f "delims=" %%a in (%gamejsPath%) do (
		set "line=%%a"
		set /a counter+=1
		setlocal enabledelayedexpansion
		if !counter! equ %line_number% (
			echo !line!
			echo.
			echo !newContent1!
			echo !newContent2!
			echo.
		) else (
			echo !line! | findstr /C:%content% >nul
			if errorlevel 1 (
				echo !line!
				echo.
			) else (
				echo !newContent3!
				echo !newContent4!
				echo.
			)
		)
		endlocal
	) >> %tmpPath%
	)
	move /y %tmpPath% %gamejsPath%
	
	chcp 936 > nul
	exit /b	
	
:fun_modify_index
	chcp 65001 > nul
	set indexPath=%buildPath%\%buildName%\index.html
	set tmpPath=.\tempindex.html
	set "f=%indexPath%"
	set "content=^</head^>"
	set "newContent=<script src='https://wzcdn.zhuomiles.com/npm/@99sw/sec-sdk/sec-sdk.umd.js'></script>"
	(for /f "delims=" %%a in (%indexPath%) do (
		set "line=%%a"
		setlocal enabledelayedexpansion
		
		echo !line! | findstr /s "--^>" >nul
		if errorlevel 1 (
			if !line! == %content% (
				echo !newContent!
				echo !line!
			) else (
				echo !line!
			)
		)
		endlocal
	) >> %tmpPath%
	)
	move /y %tmpPath% %indexPath%
	chcp 936 > nul
	exit /b	
	
:fun_create_settings
	set spath=%settingsPath%\%1
	set appid=%2
	set remoteRoot=%3
	
	mkdir %settingsPath%
	(
	echo {
	echo 	"appid": "%appid%",
	echo 	"orientation": "portrait",
	echo 	"separate_engine": false,
	echo 	"REMOTE_SERVER_ROOT": "%remoteRoot%",
	echo 	"subContext": "",
	echo 	"startSceneAssetBundle": false
	echo }
	)> %spath%
	
	exit /b
	
:fun_create_local
	set spath=%localPath%\builder.json
	set actualPlatform=%1
	set platform=%2
	set buildPath=%3
	
	mkdir %localPath%
	(
	echo {
	echo 	"platform": "%platform%",
	echo 	"actualPlatform": "%actualPlatform%",
	echo 	"template": "link",
	echo 	"buildPath": "./build",
	echo 	"debug": false,
	echo 	"sourceMaps": false,
	echo 	"embedWebDebugger": false,
	echo 	"previewWidth": "1280",
	echo 	"previewHeight": "720",
	echo 	"useDebugKeystore": true,
	echo 	"keystorePath": "",
	echo 	"keystorePassword": "",
	echo 	"keystoreAlias": "",
	echo 	"keystoreAliasPassword": "",
	echo 	"apiLevel": "",
	echo 	"appABIs": [],
	echo 	"vsVersion": "auto",
	echo 	"buildScriptsOnly": false
	echo }
	)> %spath%
	
	exit /b
	
:fun_bili_extra
	set appid=%1
	set buildName=%2
	set ver=%3
	copy %buildPath%\blapp-adapter-v2.4-cocos.js %buildPath%\%buildName%\blapp-adapter-v2.4-cocos.js
	
	rem 修改game.json
	set spath=%buildPath%\%buildName%\game.json
	(
	echo {
	echo 	"deviceOrientation": "portrait",
	echo 	"networkTimeout": {"request":5000,"connectSocket":5000,"uploadFile":5000,"downloadFile":5000},
	echo 	"subpackages": [],
	echo 	"appId": "%appid%",
	echo 	"version": "%ver%"
	echo }
	)> %spath%
	
	exit /b
	
:fun_create_release
	set appid=%1
	set buildName=%2
	set fileName=%3
	set platType=%4
	set appName=%appid%-%buildName%
	set releaseBuildPath=%releasePath%\%appName%
	set releaseBuildRemotePath=%releasePath%\%appName%\remote
	set releaseBuildNamePath=%releaseBuildPath%\%buildName%
	set releaseBuildNamePath1=%releaseBuildPath%\biligame
	set releaseBuildNameRemotePath=%releaseBuildNamePath%\remote
	set releaseBuildNameRemotePath1=%releaseBuildNamePath1%\remote
	set tempBuildPath=%buildPath%\%buildName%
	
	mkdir %releasePath%
	
	rd /s /q %releaseBuildPath%
	
	if %platType% EQU %platTypeBl% (	
		xcopy %tempBuildPath%\ %releaseBuildNamePath1%\ /s /e /y /i
		move /y %releaseBuildNameRemotePath1% %releaseBuildRemotePath%
	) else (
		xcopy %tempBuildPath% %releaseBuildNamePath% /s /e /y /i
		move /y %releaseBuildNameRemotePath% %releaseBuildRemotePath%
	)
	
	cd /d %releaseBuildPath%
	%RAR% a remote.rar ./remote
	rem %ZIP% -r ./remote.zip ./remote
	
	rd /s /q .\remote
	
	echo %fileName%>.\fileName
	
	cd /d %projectPath%
	
	exit /b
	
:fun_create_web_release
	set appid=%1
	set buildName=%2
	set fileName=%3
	set appName=%appid%-%buildName%
	set releaseBuildPath=%releasePath%\%appName%
	set releaseBuildNamePath=%releaseBuildPath%\%buildName%
	set tempBuildPath=%buildPath%\%buildName%
	
	mkdir %releasePath%
	rd /s /q %releaseBuildPath%
	
	xcopy %tempBuildPath% %releaseBuildNamePath% /s /e /y /i
	
	cd /d %releaseBuildPath%
	%RAR% a web-mobile.rar ./web-mobile	
	rem rd /s /q .\web-mobile
	
	echo %fileName%>.\fileName
	
	cd /d %projectPath%
	
	exit /b	
	
:fun_clean
	cd %projectPath%
	set buildName=%1
	rd /s /q %buildPath%\%buildName%
	exit /b
	
:fun_currtime
	for /f "tokens=2 delims==" %%a in ('wmic os get localdatetime /value') do set datetime=%%a
	set year=%datetime:~0,4%
	set month=%datetime:~4,2%
	set day=%datetime:~6,2%
	set hour=%datetime:~8,2%
	set minute=%datetime:~10,2%
	set second=%datetime:~12,2%
	set time=%year%%month%%day%_%hour%%minute%%second%
	exit /b
	
	
rem -------------操作函数--------------------------------------------	
rem 抖音平台	
:fun_build_dy_0
	set currPlatform=0
	set actualPlatform=bytedance
	set platName=mini-game
	set settingsName=bytedance.json
	set buildName=bytedance
	call :fun_currtime
	rem set fileName=douyin_%time%
	set fileName=douyin
	set remoteRoot=https://www.hnyouzong.com:443/h5_res/TowerFruitDef/%fileName%
	set ver=1.0.0
	set platType=%platTypeDy%
	set appid=ttb43cc2812b000e8902
	set appsecrect=1c008268f00e3ff1a9d8f95e0506e0a9649d744e
	set RewardVideo="1p3f22621gi581f1km"
	set Interstitial="test"
	set Banner="test"
	set gameVer="v1.0.1"
	set svnVer=110
	set GameName="消灭虫子"
	call :fun_build %actualPlatform% %platName% %settingsName% %appid% %buildName% %remoteRoot% %currPlatform% %fileName% %ver% %platType% %appsecrect% %RewardVideo% %Interstitial% %Banner% %gameVer% %svnVer% %GameName%
	goto wait_input
	
rem 微信平台	
:fun_build_wechat_1
	set currPlatform=1
	set actualPlatform=wechatgame
	set platName=mini-game
	set settingsName=wechatgame.json
	set buildName=wechatgame
	call :fun_currtime
	rem set fileName=wechat_%time%
	set fileName=wechat
	set remoteRoot=https://www.hnyouzong.com:443/h5_res/TowerFruitDef/%fileName%
	set ver=1.0.0
	set platType=%platTypeWx%
	set appid=wxad1bc3980a7320b7
	set appsecrect=abc
	set RewardVideo="adunit-86268e3e7227db8b"
	set Interstitial="test"
	set Banner="test"
	set gameVer="v1.0.1"
	set svnVer=8806
	set GameName="部落的王"
	call :fun_build %actualPlatform% %platName% %settingsName% %appid% %buildName% %remoteRoot% %currPlatform% %fileName% %ver% %platType% %appsecrect% %RewardVideo% %Interstitial% %Banner% %gameVer% %svnVer% %GameName%
	goto wait_input
	
rem 快手平台	
:fun_build_ks_2
	set currPlatform=2
	set actualPlatform=wechatgame
	set platName=mini-game
	set settingsName=wechatgame.json
	set buildName=wechatgame
	call :fun_currtime
	rem set fileName=ks_%time%
	set fileName=ks
	set remoteRoot=https://www.hnyouzong.com:443/h5_res/TowerFruitDef/%fileName%
	set ver=1.0.0
	set platType=%platTypeKs%
	set appid=ks682858293534010442
	set appsecrect=Kvspg9vTLvd0r7DN4K-ukQ
	set RewardVideo="2300022912_01"
	set Interstitial="test"
	set Banner="test"
	set gameVer="v1.0.1"
	set svnVer=8806
	set GameName="消灭虫子"
	call :fun_build %actualPlatform% %platName% %settingsName% %appid% %buildName% %remoteRoot% %currPlatform% %fileName% %ver% %platType% %appsecrect% %RewardVideo% %Interstitial% %Banner% %gameVer% %svnVer% %GameName%
	goto wait_input
	
rem bili平台	
:fun_build_bili_3
	set currPlatform=3
	set actualPlatform=wechatgame
	set platName=mini-game
	set settingsName=wechatgame.json
	set buildName=wechatgame
	call :fun_currtime
	rem set fileName=bili_%time%
	set fileName=bili
	set remoteRoot=https://www.hnyouzong.com:443/h5_res/TowerFruitDef/%fileName%
	set ver=1.0.0
	set platType=%platTypeBl%
	set appid=biligameed4f2313e8f41818
	set appsecrect=8237e13a0d2db5d9ea0f7898ffdfc4a4
	set RewardVideo="bili-211745483035357777"
	set Interstitial="test"
	set Banner="test"
	set gameVer="v1.0.1"
	set svnVer=8806
	set GameName="消灭虫子"
	call :fun_build %actualPlatform% %platName% %settingsName% %appid% %buildName% %remoteRoot% %currPlatform% %fileName% %ver% %platType% %appsecrect% %RewardVideo% %Interstitial% %Banner% %gameVer% %svnVer% %GameName%
	goto wait_input
	
rem web sec平台	
:fun_build_sec_4
	set currPlatform=4
	set actualPlatform=web-mobile
	set platName=web-mobile
	set settingsName=sec
	set buildName=web-mobile
	call :fun_currtime
	rem set fileName=web_%time%
	set fileName=web_sec
	set remoteRoot=https://
	set ver=1.0.0
	set platType=%platTypeSec%
	set appid=sec
	set appsecrect=abc
	set RewardVideo="test"
	set Interstitial="test"
	set Banner="test"
	set gameVer="v1.0.1"
	set svnVer=110
	set GameName="sec"
	call :fun_build %actualPlatform% %platName% %settingsName% %appid% %buildName% %remoteRoot% %currPlatform% %fileName% %ver% %platType% %appsecrect% %RewardVideo% %Interstitial% %Banner% %gameVer% %svnVer% %GameName%
	goto wait_input	
	
rem 百度平台	
:fun_build_baidu_5
	set currPlatform=5
	set actualPlatform=baidugame
	set platName=mini-game
	set settingsName=baidugame.json
	set buildName=baidugame
	call :fun_currtime
	rem set fileName=baidu_%time%
	set fileName=baidu
	set remoteRoot=https://www.hnyouzong.com:443/h5_res/TowerFruitDef/%fileName%
	set ver=1.0.0
	set platType=%platTypeBd%
	set appid=10000
	set appsecrect=abc
	set RewardVideo="test"
	set Interstitial="test"
	set Banner="test"
	set gameVer="v1.0.1"
	set svnVer=110
	set GameName="百度"
	call :fun_build %actualPlatform% %platName% %settingsName% %appid% %buildName% %remoteRoot% %currPlatform% %fileName% %ver% %platType% %appsecrect% %RewardVideo% %Interstitial% %Banner% %gameVer% %svnVer% %GameName%
	goto wait_input	
	
rem web平台	
:fun_build_web
	set currPlatform=0
	set actualPlatform=web-mobile
	set platName=web-mobile
	set settingsName=web
	set buildName=web-mobile
	call :fun_currtime
	rem set fileName=web_%time%
	set fileName=web
	set remoteRoot=https://
	set ver=1.0.0
	set platType=%platTypeWeb%
	set appid=web
	set appsecrect=abc
	set RewardVideo="test"
	set Interstitial="test"
	set Banner="test"
	set gameVer="v1.0.1"
	set svnVer=110
	set GameName="web"
	call :fun_build %actualPlatform% %platName% %settingsName% %appid% %buildName% %remoteRoot% %currPlatform% %fileName% %ver% %platType% %appsecrect% %RewardVideo% %Interstitial% %Banner% %gameVer% %svnVer% %GameName%
	goto wait_input	
	
	
rem 清理抖音
:fun_clean_dy
	set buildName=bytedance
	call :fun_clean %buildName%
	
	goto wait_input
	
rem 清理微信
:fun_clean_wechat
	set buildName=wechatgame
	call :fun_clean %buildName%
	
	goto wait_input
	
rem 清理快手
:fun_clean_ks
	set buildName=wechatgame
	call :fun_clean %buildName%
	
	goto wait_input	

rem 清理web
:fun_clean_web
	set buildName=web-mobile
	call :fun_clean %buildName%
	
	goto wait_input
	
:fun_gettime
	call :fun_currtime
	echo %time%
	goto wait_input	
	
rem 退出	
:end
	exit 0
	
endlocal