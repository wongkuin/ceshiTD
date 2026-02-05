@echo off
chcp 65001 >nul
echo ========================================
echo  CocosCreator PNG图片压缩工具
echo ========================================
echo.

REM 检查Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未找到Python，请先安装Python 3.x
    echo 下载地址: https://www.python.org/downloads/
    pause
    exit /b 1
)

REM 检查依赖
pip show Pillow >nul 2>&1
if errorlevel 1 (
    echo ⚠️  正在安装Pillow库...
    pip install pillow --quiet
)

REM 运行压缩脚本
echo 🚀 开始压缩PNG图片...
echo.

REM 这里可以添加参数
REM 示例: python compress_png.py --quality 60-80 --speed 4
python compress_png.py --quality 60-80 --speed 4 %*

if errorlevel 1 (
    echo.
    echo ❌ 压缩过程中出现错误
    pause
    exit /b 1
) else (
    echo.
    echo ✅ 压缩完成！
    timeout /t 3 >nul
)