#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
安装脚本
"""

import os
import sys
import urllib.request
import zipfile
import tempfile
import shutil

def download_pngquant():
    """下载pngquant"""
    print("正在下载pngquant...")
    
    url = "https://pngquant.org/pngquant-windows.zip"
    temp_dir = tempfile.gettempdir()
    zip_path = os.path.join(temp_dir, "pngquant-windows.zip")
    
    try:
        # 下载
        urllib.request.urlretrieve(url, zip_path)
        
        # 解压
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall("pngquant")
        
        # 移动文件
        if not os.path.exists("tools"):
            os.makedirs("tools")
        
        pngquant_exe = None
        for root, dirs, files in os.walk("pngquant"):
            for file in files:
                if file.lower() == "pngquant.exe":
                    pngquant_exe = os.path.join(root, file)
                    break
        
        if pngquant_exe:
            shutil.copy(pngquant_exe, "tools/pngquant.exe")
            print("✅ pngquant 安装完成")
        else:
            print("❌ 未找到pngquant.exe")
            
    except Exception as e:
        print(f"❌ 下载失败: {e}")
        print("请手动下载: https://pngquant.org/pngquant-windows.zip")
        print("解压后将pngquant.exe放在tools/目录下")

def create_shortcut():
    """创建快捷方式（Windows）"""
    try:
        import winshell
        from win32com.client import Dispatch
        
        desktop = winshell.desktop()
        path = os.path.join(desktop, "Cocos压缩工具.lnk")
        target = sys.executable
        wDir = os.getcwd()
        icon = os.path.join(wDir, "tools", "icon.ico") if os.path.exists("tools/icon.ico") else ""
        
        shell = Dispatch('WScript.Shell')
        shortcut = shell.CreateShortCut(path)
        shortcut.Targetpath = target
        shortcut.Arguments = 'cocos_compress_tool.py gui'
        shortcut.WorkingDirectory = wDir
        if icon:
            shortcut.IconLocation = icon
        shortcut.save()
        
        print("✅ 桌面快捷方式创建完成")
    except:
        print("⚠️  无法创建快捷方式")

def install():
    """安装"""
    print("🎮 CocosCreator PNG压缩工具安装")
    print("="*50)
    
    # 1. 检查Python
    if sys.version_info < (3, 6):
        print("❌ 需要Python 3.6或更高版本")
        sys.exit(1)
    
    # 2. 创建目录结构
    os.makedirs("tools", exist_ok=True)
    os.makedirs("backups", exist_ok=True)
    
    # 3. 下载pngquant
    download_pngquant()
    
    # 4. 安装Python依赖
    print("\n正在安装Python依赖...")
    os.system("pip install pillow pyyaml")
    
    # 5. 创建快捷方式
    if sys.platform == "win32":
        create_shortcut()
    
    # 6. 创建启动脚本
    with open("启动压缩工具.bat", "w", encoding="gbk") as f:
        f.write("""@echo off
chcp 65001 >nul
echo ========================================
echo  CocosCreator PNG图片压缩工具
echo ========================================
echo.
python cocos_compress_tool.py gui
pause
""")
    
    print("\n✅ 安装完成!")
    print("📁 文件结构:")
    print("  compress_png.py        - 主压缩脚本")
    print("  cocos_compress_tool.py - GUI工具")
    print("  启动压缩工具.bat       - 启动脚本")
    print("  tools/                - 工具目录")
    print("\n🚀 使用方法:")
    print("  1. 双击'启动压缩工具.bat'使用GUI")
    print("  2. 或运行: python compress_png.py [目录]")

if __name__ == '__main__':
    install()