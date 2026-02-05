#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
可配置的PNG压缩脚本
"""

import json
import yaml
import os
from compress_png import PNGCompressor

class ConfigurableCompressor(PNGCompressor):
    def __init__(self, config_file=None):
        # 默认配置
        default_config = {
            'compression': {
                'quality': '65-80',
                'speed': 3,
                'skip_if_larger': True,
                'max_workers': 4
            },
            'directories': {
                'include': [
                    'assets',
                    'resources',
                    'Module'
                ],
                'exclude': [
                    'node_modules',
                    'build',
                    'temp',
                    'spine',
                    'library',
                    'settings',
                    'packages',
                    'TRFrameWork',
                    '.git'
                ]
            },
            'file_patterns': {
                'include': ['*.png', '*.PNG'],
                'exclude': [
                    '*_nopack*',
                    '*_uncompressed*',
                    'icon*.png'
                ]
            },
            'output': {
                'generate_report': True,
                'report_format': 'txt',  # txt, json, html
                'backup_original': False
            }
        }
        
        # 加载配置文件
        if config_file and os.path.exists(config_file):
            if config_file.endswith('.json'):
                with open(config_file, 'r', encoding='utf-8') as f:
                    user_config = json.load(f)
            elif config_file.endswith(('.yaml', '.yml')):
                with open(config_file, 'r', encoding='utf-8') as f:
                    user_config = yaml.safe_load(f)
            else:
                raise ValueError("不支持的配置文件格式")
            
            # 合并配置
            self.merge_configs(default_config, user_config)
        else:
            print("⚠️  未找到配置文件，使用默认配置")
        
        super().__init__(default_config)
    
    def merge_configs(self, default, user):
        """递归合并配置"""
        for key, value in user.items():
            if key in default and isinstance(default[key], dict) and isinstance(value, dict):
                self.merge_configs(default[key], value)
            else:
                default[key] = value

def create_default_config():
    """创建默认配置文件"""
    config = {
        'version': '1.0',
        'description': 'CocosCreator PNG压缩配置',
        'compression': {
            'quality': '60-80',
            'speed': 3,
            'skip_if_larger': True,
            'max_concurrent': 4
        },
        'paths': {
            'pngquant': 'auto',  # auto, 或指定路径
            'source_dirs': [
                '.'
            ],
            'exclude_patterns': [
                'node_modules/**',
                'build/**',
                'temp/**',
                'library/**',
                'settings/**',
                '.git/**',
                '**/*_nopack*',
                '**/*_uncompressed*'
            ]
        },
        'backup': {
            'enabled': True,
            'backup_dir': 'backup_png',
            'keep_days': 7
        },
        'report': {
            'enabled': True,
            'output_dir': '压缩报告',
            'formats': ['txt', 'json']
        }
    }
    
    # 保存JSON配置
    with open('compress_config.json', 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=2, ensure_ascii=False)
    
    print("✅ 已创建默认配置文件: compress_config.json")
    print("请根据需要修改配置后重新运行")

if __name__ == '__main__':
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == 'init':
        create_default_config()
    else:
        config_file = None
        if len(sys.argv) > 1:
            config_file = sys.argv[1]
        elif os.path.exists('compress_config.json'):
            config_file = 'compress_config.json'
        
        compressor = ConfigurableCompressor(config_file)
        compressor.run()