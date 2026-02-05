#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CocosCreator PNG图片压缩脚本
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path
from datetime import datetime
import argparse

class PNGCompressor:
    def __init__(self, config=None):
        self.config = {
            'quality': '65-80',      # 压缩质量范围
            'speed': 3,              # 压缩速度 (1慢-11快)
            'skip_if_larger': True,  # 如果压缩后更大则跳过
            'extensions': ['.png', '.PNG'],
            'pngquant_path': self.find_pngquant(),  # 自动查找pngquant
            'max_workers': 4,        # 最大并行数
        }
        if config:
            self.config.update(config)
        
        self.total_files = 0
        self.processed_files = 0
        self.skipped_files = 0
        self.failed_files = 0
        self.original_total_size = 0
        self.compressed_total_size = 0
        self.start_time = None
        
    def find_pngquant(self):
        """自动查找pngquant.exe"""
        # 1. 检查系统PATH
        pngquant_exe = shutil.which('pngquant')
        if pngquant_exe:
            return pngquant_exe
            
        # 2. 检查常见安装位置
        common_paths = [
            r'C:\Program Files\pngquant\pngquant.exe',
            r'C:\Program Files (x86)\pngquant\pngquant.exe',
            r'C:\pngquant\pngquant.exe',
            os.path.join(os.path.dirname(__file__), 'pngquant', 'pngquant.exe'),
        ]
        
        for path in common_paths:
            if os.path.exists(path):
                return path
                
        # 3. 如果没找到，尝试下载
        print("❌ 未找到pngquant.exe")
        print("请从 https://pngquant.org/pngquant-windows.zip 下载并解压到:")
        print("1. 系统PATH目录")
        print("2. 项目目录下的pngquant文件夹")
        print("3. 或指定完整路径")
        return None
    
    def should_ignore(self, path):
        """判断是否应该忽略该路径"""
        ignore_dirs = [
            'node_modules',
            'build',
            'temp',
            'library',
            'GameTD',
            'settings',
            'spine',
            'TRFrameWork',
            'packages',
            '.git',
            '.vscode',
            '.idea',
            '新资源',
            '__pycache__',
            'backup',
            '压缩前备份'
        ]
        
        path_str = str(path)
        for ignore_dir in ignore_dirs:
            if ignore_dir in path_str:
                return True
        return False
    
    def find_png_files(self, root_dir):
        """递归查找所有PNG文件"""
        png_files = []
        root_path = Path(root_dir)
        
        print(f"🔍 在 {root_dir} 中搜索PNG文件...")
        
        for ext in self.config['extensions']:
            for png_file in root_path.rglob(f'*{ext}'):
                if not self.should_ignore(png_file):
                    png_files.append(png_file)
                    
        print(f"✅ 找到 {len(png_files)} 个PNG文件")
        return png_files
    
    def compress_file(self, file_path):
        """压缩单个文件"""
        try:
            # 获取原文件大小
            original_size = os.path.getsize(file_path)
            
            # 创建临时文件
            temp_file = str(file_path) + '.tmp'
            
            # 构建命令
            cmd = [
                self.config['pngquant_path'],
                f'--quality={self.config["quality"]}',
                f'--speed={self.config["speed"]}',
                '--force',
                '--output', temp_file,
                '--', str(file_path)
            ]
            
            # 执行压缩
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == 'win32' else 0
            )
            
            if result.returncode != 0:
                raise Exception(f"pngquant错误: {result.stderr}")
            
            # 检查压缩后文件
            if not os.path.exists(temp_file):
                raise Exception("压缩后文件未生成")
                
            compressed_size = os.path.getsize(temp_file)
            
            # 检查是否应该跳过
            if self.config['skip_if_larger'] and compressed_size >= original_size:
                os.remove(temp_file)
                return {
                    'status': 'skipped',
                    'file': str(file_path),
                    'original': original_size,
                    'compressed': compressed_size,
                    'saved': 0,
                    'ratio': 0
                }
            
            # 替换原文件
            backup_file = None
            if os.path.exists(file_path):
                backup_file = str(file_path) + '.bak'
                shutil.copy2(file_path, backup_file)
                os.remove(file_path)
            
            shutil.move(temp_file, file_path)
            
            # 清理备份文件
            if backup_file and os.path.exists(backup_file):
                os.remove(backup_file)
            
            saved = original_size - compressed_size
            ratio = (saved / original_size * 100) if original_size > 0 else 0
            
            return {
                'status': 'success',
                'file': str(file_path),
                'original': original_size,
                'compressed': compressed_size,
                'saved': saved,
                'ratio': ratio
            }
            
        except Exception as e:
            # 清理临时文件
            temp_files = [str(file_path) + '.tmp', str(file_path) + '.bak']
            for temp in temp_files:
                if os.path.exists(temp):
                    try:
                        os.remove(temp)
                    except:
                        pass
            
            return {
                'status': 'failed',
                'file': str(file_path),
                'error': str(e)
            }
    
    def print_progress(self, result):
        """打印进度信息"""
        self.processed_files += 1
        
        # 计算进度百分比
        progress = (self.processed_files / self.total_files * 100) if self.total_files > 0 else 0
        
        # 计算已处理时间
        elapsed = datetime.now() - self.start_time
        elapsed_str = str(elapsed).split('.')[0]  # 移除微秒部分
        
        # 估计剩余时间
        if self.processed_files > 0:
            time_per_file = elapsed.total_seconds() / self.processed_files
            remaining_files = self.total_files - self.processed_files
            remaining_time = time_per_file * remaining_files
            
            if remaining_time > 3600:
                remaining_str = f"{remaining_time/3600:.1f}小时"
            elif remaining_time > 60:
                remaining_str = f"{remaining_time/60:.1f}分钟"
            else:
                remaining_str = f"{remaining_time:.0f}秒"
        else:
            remaining_str = "计算中..."
        
        # 更新统计数据
        if result['status'] == 'success':
            self.original_total_size += result['original']
            self.compressed_total_size += result['compressed']
        elif result['status'] == 'skipped':
            self.skipped_files += 1
            self.original_total_size += result['original']
            self.compressed_total_size += result['compressed']
        elif result['status'] == 'failed':
            self.failed_files += 1
        
        # 构建状态信息
        status_symbol = {
            'success': '✅',
            'skipped': '⏭️',
            'failed': '❌'
        }.get(result['status'], '❓')
        
        # 显示当前文件结果
        if result['status'] in ['success', 'skipped']:
            file_name = os.path.basename(result['file'])
            size_info = f"{result['original']/1024:.1f}KB -> {result['compressed']/1024:.1f}KB"
            ratio_info = f"-{result['ratio']:.1f}%" if result['ratio'] > 0 else "(更大)"
            print(f"{status_symbol} {file_name:30} {size_info:25} {ratio_info}")
        elif result['status'] == 'failed':
            print(f"❌ {os.path.basename(result['file'])}: {result['error']}")
        
        # 显示总进度
        sys.stdout.write(f"\r📊 进度: {self.processed_files}/{self.total_files} ({progress:.1f}%) | "
                        f"用时: {elapsed_str} | 剩余: {remaining_str}")
        sys.stdout.flush()
    
    def print_summary(self):
        """打印总结报告"""
        print("\n" + "="*60)
        print("📋 压缩完成总结")
        print("="*60)
        
        total_saved = self.original_total_size - self.compressed_total_size
        total_ratio = (total_saved / self.original_total_size * 100) if self.original_total_size > 0 else 0
        
        # 文件统计
        print(f"📁 文件统计:")
        print(f"   总计文件: {self.total_files}")
        print(f"   成功压缩: {self.total_files - self.skipped_files - self.failed_files}")
        print(f"   跳过文件: {self.skipped_files}")
        print(f"   失败文件: {self.failed_files}")
        
        # 大小统计
        print(f"\n💾 大小统计:")
        print(f"   原始大小: {self.format_size(self.original_total_size)}")
        print(f"   压缩大小: {self.format_size(self.compressed_total_size)}")
        print(f"   节约空间: {self.format_size(total_saved)} ({total_ratio:.2f}%)")
        
        # 时间统计
        elapsed = datetime.now() - self.start_time
        print(f"\n⏱️  时间统计:")
        print(f"   总用时: {str(elapsed).split('.')[0]}")
        if self.processed_files > 0:
            avg_time = elapsed.total_seconds() / self.processed_files
            print(f"   平均每个文件: {avg_time:.2f}秒")
        
        print("="*60)
    
    def format_size(self, size_bytes):
        """格式化文件大小"""
        if size_bytes >= 1024*1024*1024:
            return f"{size_bytes/(1024*1024*1024):.2f} GB"
        elif size_bytes >= 1024*1024:
            return f"{size_bytes/(1024*1024):.2f} MB"
        elif size_bytes >= 1024:
            return f"{size_bytes/1024:.2f} KB"
        else:
            return f"{size_bytes} B"
    
    def run(self, target_dir=None):
        """运行压缩"""
        if not self.config['pngquant_path'] or not os.path.exists(self.config['pngquant_path']):
            print("❌ 错误: 未找到pngquant.exe")
            print("请指定pngquant路径或将其添加到系统PATH")
            return False
        
        target_dir = target_dir or os.getcwd()
        
        print("🎮 CocosCreator PNG图片压缩工具")
        print("="*60)
        print(f"目标目录: {target_dir}")
        print(f"质量设置: {self.config['quality']}")
        print(f"压缩速度: {self.config['speed']}")
        print(f"PNGQUANT: {self.config['pngquant_path']}")
        print("="*60)
        
        # 查找文件
        png_files = self.find_png_files(target_dir)
        if not png_files:
            print("⚠️  未找到PNG文件")
            return True
        
        self.total_files = len(png_files)
        self.start_time = datetime.now()
        
        print("\n🚀 开始压缩...\n")
        
        # 逐文件压缩
        for i, png_file in enumerate(png_files, 1):
            result = self.compress_file(png_file)
            self.print_progress(result)
        
        print()  # 换行
        self.print_summary()
        
        return self.failed_files == 0

def main():
    """主函数"""
    parser = argparse.ArgumentParser(description='CocosCreator PNG图片压缩工具')
    parser.add_argument('directory', nargs='?', default='.', 
                       help='要压缩的目录 (默认: 当前目录)')
    parser.add_argument('--quality', '-q', default='65-80',
                       help='压缩质量范围，如 60-80 (默认: 65-80)')
    parser.add_argument('--speed', '-s', type=int, default=3,
                       help='压缩速度 1-11 (1最慢质量最好，11最快，默认: 3)')
    parser.add_argument('--pngquant', '-p',
                       help='pngquant.exe的完整路径')
    parser.add_argument('--no-skip', action='store_false', dest='skip_if_larger',
                       help='不跳过压缩后变大的文件')
    
    args = parser.parse_args()
    
    # 配置
    config = {
        'quality': args.quality,
        'speed': args.speed,
        'skip_if_larger': args.skip_if_larger,
    }
    
    if args.pngquant:
        config['pngquant_path'] = args.pngquant
    
    # 创建压缩器并运行
    compressor = PNGCompressor(config)
    success = compressor.run(args.directory)
    
    sys.exit(0 if success else 1)

if __name__ == '__main__':
    main()