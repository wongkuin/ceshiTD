import os
import subprocess
import re
import json
import time
import shutil
from datetime import datetime
from PIL import Image
import io
import zipfile
import tarfile
import tempfile

def run_command_in_directory(command, relative_dir):
    """
    在指定目录下全运行命令
    安
    参数:
        command: 要执行的命令（可以是字符串或列表）
        relative_dir: 相对于当前脚本的目录
    """
    print(f"尝试运行命令: '{command}' 在目录: '{relative_dir}'")
    
    # 获取当前脚本目录
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
    except:
        script_dir = os.getcwd()
    
    # 构建目标目录路径
    target_dir = os.path.abspath(os.path.join(script_dir, relative_dir))
    print(f"完整目标目录路径: {target_dir}")
    
    # 检查目录是否存在
    if not os.path.exists(target_dir):
        print(f"❌ 错误：目录不存在 - {target_dir}")
        return False
    
    print(f"✅ 目录存在")
    
    # 尝试执行命令（两种方式）
    success = False
    
    # 方法1：作为命令执行
    print("\n尝试直接执行命令...")
    try:
        # 如果传入的是字符串，使用shell=True执行
        if isinstance(command, str):
            result = subprocess.run(
                command,
                cwd=target_dir,
                shell=True,
                capture_output=True,
                text=True,
                encoding='gbk'
            )
        # 如果传入的是列表，直接执行
        elif isinstance(command, list):
            result = subprocess.run(
                command,
                cwd=target_dir,
                capture_output=True,
                text=True,
                encoding='gbk'
            )
        
        # 输出执行结果
        print(f"退出代码: {result.returncode}")
        print("输出内容:")
        print(result.stdout)
        if result.stderr:
            print("错误输出:")
            print(result.stderr)
        
        if result.returncode == 0:
            print("✅ 命令执行成功！")
            success = True
        else:
            print(f"❌ 命令执行失败，错误码: {result.returncode}")
    except Exception as e:
        print(f"❌ 命令执行出错: {str(e)}")
    
    # 方法2：通过批处理文件执行（如果第一种方法失败）
    if not success:
        print("\n尝试通过批处理文件执行...")
        bat_path = os.path.join(target_dir, "__export.bat")
        if os.path.exists(bat_path):
            try:
                # 设置命令参数
                command_str = "tools\py37\py37.exe __export.py -p client -f compact_json"
                bat_command = f"{bat_path} {command_str}" if bat_path.endswith('.bat') else f"{bat_path} \\; {command_str}"
                
                result = subprocess.run(
                    ["cmd", "/c", bat_command],
                    cwd=target_dir,
                    capture_output=True,
                    text=True,
                    encoding='gbk'
                )
                
                # 输出执行结果
                print(f"退出代码: {result.returncode}")
                print("输出内容:")
                print(result.stdout)
                if result.stderr:
                    print("错误输出:")
                    print(result.stderr)
                
                if result.returncode == 0:
                    print("✅ 通过批处理执行成功！")
                    success = True
                else:
                    print(f"❌ 通过批处理执行失败，错误码: {result.returncode}")
            except Exception as e:
                print(f"❌ 批处理执行出错: {str(e)}")
        else:
            print(f"❌ 批处理文件不存在: {bat_path}")
    
    return success


def run_batch_safely(script_name, relative_dir):
    """安全运行批处理脚本（带详细路径检查）"""
    
    print(f"尝试运行批处理脚本: '{script_name}' 在目录: '{relative_dir}'")
    
    # 1. 获取当前脚本目录（更可靠的方法）
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        # print(f"当前脚本目录: {script_dir}")
    except:
        script_dir = os.getcwd()
        # print(f"无法获取脚本目录，使用工作目录: {script_dir}")
    
    # 2. 构建目标目录路径
    target_dir = os.path.abspath(os.path.join(script_dir, relative_dir))
    # print(f"完整目标目录路径: {target_dir}")
    
    # 3. 检查目录是否存在
    if not os.path.exists(target_dir):
        print(f"❌ 错误：目录不存在 - {target_dir}")
        return False
    
    # print(f"✅ 目录存在")
    
    # 4. 构建批处理文件完整路径
    batch_path = os.path.join(target_dir, script_name)
    print(f"批处理文件路径: {batch_path}")
    
    # 5. 检查文件是否存在
    if not os.path.exists(batch_path):
        print(f"❌ 错误：批处理文件不存在")
        
        # 列出目录内容以便调试
        try:
            print("\n目录内容:")
            for item in os.listdir(target_dir):
                print(f"  - {item}")
        except Exception as e:
            print(f"无法列出目录内容: {str(e)}")
        
        return False
    
    # print(f"✅ 批处理文件存在")
    
    # 6. 确保是可执行文件
    if not batch_path.endswith(('.bat', '.cmd')):
        print(f"⚠️ 警告：文件不是批处理文件 ({batch_path})")
    
    # 7. 尝试执行批处理文件（多种方法）
    methods = [
        {"command": [batch_path], "desc": "直接执行"},
        {"command": ["cmd", "/c", batch_path], "desc": "通过cmd执行"},
        {"command": ["powershell", "-Command", f"& '{batch_path}'"], "desc": "通过PowerShell执行"},
        {"command": f'"{batch_path}"', "shell": True, "desc": "通过shell执行"}
    ]
    
    for method in methods:
        print(f"\n尝试方法: {method['desc']}")
        try:
            # 构造命令
            command = method.get("command", [])
            shell = method.get("shell", False)
            
            result = subprocess.run(
                command,
                cwd=target_dir,
                shell=shell,
                check=True,
                capture_output=True,
                text=True,
                encoding='gbk'
            )
            
            print(f"✅ 执行成功！退出代码: {result.returncode}")
            # print("输出内容:")
            # print(result.stdout)
            return True
            
        except subprocess.CalledProcessError as e:
            print(f"❌ 执行失败，退出代码: {e.returncode}")
            print("错误输出:")
            print(e.stderr)
            print("标准输出:")
            print(e.stdout)
        except Exception as e:
            print(f"❌ 意外错误: {str(e)}")
    
    return False

"""
对最后两位字符进行异或处理
:param last_two: 原字符串的最后两位
:param xor_key: 异或密钥（长度至少为2）
:return: 异或处理后的两位字符的十六进制表示
"""
def xor_last_two(last_two, xor_key):
   
    # 确保密钥至少有一位
    key0 = ord(xor_key[0])
    key1 = ord(xor_key[1]) if len(xor_key) > 1 else key0
    
    # 获取最后两位字符的ASCII值
    char0 = ord(last_two[0])
    char1 = ord(last_two[1])
    
    # 进行异或运算
    result0 = key0 if key0 == char0 else char0 ^ key0
    result1 = key1 if key1 == char1 else char1 ^ key1
    
    # 转换为十六进制字符串
    hex0 = format(result0, '02x')
    hex1 = format(result1, '02x')
    return hex0 + hex1

"""
使用pngquant压缩PNG图片
:param input_path: 输入图片路径
:return: 压缩后的图片数据
"""
def compress_png_with_pngquant(input_path):
    try:
        # 使用临时文件保存压缩结果
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp_file:
            temp_path = temp_file.name
        
        # 构建pngquant命令
        cmd = [
            'pngquant',
            '--force',  # 覆盖现有文件
            '--speed', '1',  # 最慢但最高压缩率
            '--quality', '65-80',  # 质量范围
            '--output', temp_path,
            input_path
        ]
        
        # 执行压缩
        result = subprocess.run(cmd, capture_output=True)
        if result.returncode != 0:
            print(f"pngquant error ({result.returncode}): {result.stderr.decode()}", input_path)
            return None
        
        #读取压缩后的图片数据
        with open(temp_path, 'rb') as f:
            compressed_data = f.read()
        
        # 删除临时文件
        os.unlink(temp_path)
        
        return compressed_data
    except Exception as e:
        print(f"Error compressing PNG: {str(e)}")
        return None
    
def compress_png_with_optipng(input_path, output_path=None):
    """
    使用 OptiPNG 无损压缩 PNG 图片
    :param input_path: 输入图片路径
    :param output_path: 输出图片路径（可选）
    :return: 压缩后的图片路径
    """
    if output_path is None:
        output_path = input_path
    
    try:
        # 构建 OptiPNG 命令
        cmd = [
            'optipng',
            '-o7',  # 最高压缩级别
            '-strip', 'all',  # 删除所有元数据
            '-clobber',  # 覆盖现有文件
            '-out', output_path,  # 输出文件
            input_path  # 输入文件
        ]
        
        # 执行压缩
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            print(f"OptiPNG error ({result.returncode}): {result.stderr}")
            return None
        
        return output_path
    except Exception as e:
        print(f"Error compressing PNG with OptiPNG: {str(e)}")
        return None
    
"""
压缩JPG图片
:param input_path: 输入图片路径
:return: 压缩后的图片数据
"""
def compress_jpg(input_path):
    try:
        with Image.open(input_path) as img:
            # 创建内存缓冲区
            buffer = io.BytesIO()
            
            # 保存为JPG，质量为80%
            img.save(buffer, format='JPEG', quality=80)
            
            return buffer.getvalue()
    except Exception as e:
        print(f"Error compressing JPG: {str(e)}")
        return None

"""
修改文件路径，应用重定向规则
:param original_path: 原始文件路径
:return: 修改后的文件路径
"""
def redirect_url(original_path):
    # 分离目录和文件名
    dir_path, filename_with_ext = os.path.split(original_path)
    filename, extension = os.path.splitext(filename_with_ext)
    
    # 检查是否为需要处理的文件类型
    if not re.search(r'\.(png|jpg|jpeg|json)$', filename_with_ext, re.IGNORECASE):
        return original_path
    
    # 如果文件名长度小于2，不处理
    if len(filename) < 2:
        return original_path
    
    # 获取最后两位字符
    last_two_chars = filename[-2:]
    
    # 从文件名中获取异或密钥 (位置1-2)
    xor_key = filename[1:3] if len(filename) >= 3 else "00"
    
    # 对最后两位进行异或处理
    transformed_last_two = xor_last_two(last_two_chars, xor_key)
    
    # 重组文件名
    new_filename = filename[:-2] + transformed_last_two + extension
    
    # 重组路径
    new_path = os.path.join(dir_path, new_filename)

    return new_path


class ConfigMgr:
    def __init__(self):

        self.load_config()
        # Platform types
        self.platTypeWeb = 0
        self.platTypeDy = 1
        self.platTypeWx = 2
        self.platTypeKs = 3
        self.platTypeSec = 4
        self.platTypeBl = 5
        self.platTypeBd = 6
        

    def load_config(self):
        """Load configuration from JSON file"""
        config_file = "./buildConfig.json"
        try:
            with open(config_file, 'r', encoding='utf-8') as f:
                self.config = json.load(f)
                self.project_path = self.config["paths"]["project_path"]
                self.COCOS = self.config["paths"]["cocos_path"]
                self.start_scene = self.config["paths"]["start_scene"]
                self.config_path = os.path.join(self.project_path ,self.config["paths"]["config_path"]) 
                self.build_path = os.path.join(self.project_path, self.config["paths"]["build_path"]) 
                self.settings_path = os.path.join(self.project_path, self.config["paths"]["settings_path"]) 
                self.local_path = os.path.join(self.project_path, self.config["paths"]["local_path"]) 
                self.release_path = os.path.join(self.project_path, self.config["paths"]["release_path"])
                self.orientation =  self.config["paths"]["orientation"]
                self.debug = self.config["paths"]["debug"]
                self.copy_root = self.config["paths"]["copy_root"]
                self.copy_files = self.config["paths"]["copy_files"]
                self.game_id = self.config["paths"]["game_id"]

        except FileNotFoundError:
            raise Exception(f"Config file not found: {config_file}")
        except json.JSONDecodeError:
            raise Exception(f"Invalid JSON in config file: {config_file}")

    def get_build_config(self, platform_key: str):
        """Get build configuration for specified platform"""
        config = self.config["build_config"].get(platform_key)
        if not config:
            raise ValueError(f"No configuration found for platform: {platform_key}")
        return config
        
    def run(self):
        while True:
            self.show_menu()
            user_input = input("请输入指令: ").strip()
            print("-------------------------------")
            
            if not user_input:
                continue
                
            if user_input == "quit":
                break
                
            self.process_command(user_input)
    
    def show_menu(self):
        print("\n==============================")
        # print("dy_0:       构建抖音")
        # print("wechat_1:   构建微信")
        # print("ks_2:       构建快手")
        # print("bili_3:     构建bili")
        # print("sec_4:      构建sec")
        # print("baidu_5:    构建baidu")
        print("\n可用的构建配置:")
        print("web:        构建web")
        if "build_config" in self.config:
            for config_name in self.config["build_config"].keys():
                if config_name in 'template':
                    continue
                print(f"{config_name}     构建")
        else:
            print("  未找到 build_config 配置")
        print()
        # print("clean_dy:   清理抖音")
        # print("clean_wechat: 清理微信")
        # print("clean_ks:   清理快手")
        # print("clean_web:  清理web")
        print("time:      当前时间")
        print("quit:      结束运行")
        print("-------------------------------")
    
    def process_command(self, command):
        clist=command.split("_")
        if len(clist) < 2:
            channel = "public"
        else:
            channel = clist[1]

        if command.startswith('dy'):
            self.build_dy(channel)
        elif command.startswith('wechat'):
            self.build_wechat(channel)
        elif command.startswith('ks'):
            self.build_ks(channel)
        elif command.startswith('bili'):
            self.build_bili(channel)
        elif command.startswith('sec'):
            self.build_sec(channel)
        elif command.startswith('baidu'):
            self.build_baidu(channel)
        elif command.startswith('web'):
            self.build_web(channel)

        elif command == "clean_dy":
            self.clean("bytedance")
        elif command == "clean_wechat":
            self.clean("wechatgame")
        elif command == "clean_ks":
            self.clean("wechatgame")
        elif command == "clean_web":
            self.clean("web-mobile")
        elif command == "time":
            print(self.get_current_time())
        else:
            print("无效指令")
    

    def get_svn_revision(self, path='./'):
        """
        获取指定路径的 SVN 修订版本号
        :param path: SVN 工作副本路径，默认为当前目录
        :return: 修订版本号 (整数)
        """
        try:

            subprocess.run(['svn', 'update'], check=True)

            # 执行 svn log 命令，只获取最后一条记录
            result = subprocess.run(
                ['svn', 'log', '-l', '1', '--quiet', path],
                capture_output=True,
                text=True,
                check=True
            )
        
            # 解析输出，格式示例: "r12345 | username | 2023-06-15 12:34:56 +0800 (Thu, 15 Jun 2023)"
            for line in result.stdout.splitlines():
                if line.strip() == '-' * len(line):
                    continue
                    
                # 尝试解析标题行
                # if revision is None:
                    # rev_data = parse_svn_log_line(line)
                    # if rev_data[0]:
                    #     revision, author, date = rev_data
                    #     continue
                match = re.search(r'^r(\d+)', line.strip())
                if match:
                    return int(match.group(1))
                else:
                    raise ValueError("无法从 svn log 输出中解析版本号")
                
        except subprocess.CalledProcessError as e:
            raise RuntimeError(f"SVN 命令失败: {e.stderr}") from e
        except FileNotFoundError:
            raise RuntimeError("SVN 命令未找到，请确保 SVN 已安装")

    def build_py(self, platformName, channel, platform, svnVer):
        self.load_config()
        
        platform_key = f"{platformName}_{channel}"
        config = self.get_build_config(platform_key)
        if not config:
            print(f"No configuration found for platform: {platform_key}")
            return

        debug = self.debug
        orientation = self.orientation
        inline_sprite_frames = "true"
        # Get parameters from config
        actual_platform = config["actual_platform"]
        plat_name = config["plat_name"]  # 游戏类型
        settings_name = config["settings_name"]
        appid = config["appid"]
        build_name = config["build_name"]
        file_name = config.get("file_name", build_name)
        remote_root = config["remote_root"]
        channel = channel #config["curr_platform"]
        # ver = config.get("ver", "1.0.0")
        platformID = platform
        app_secret = config["app_secret"]
        reward_video = config["reward_video"]
        interstitial = config["interstitial"]
        banner = config["banner"]
        game_ver = config.get("game_ver", "v1.0.0")
        svn_ver = config.get("svn_ver", 1)
        game_name = config["game_name"]
        game_id = self.game_id

        plat_type = platformID

        # svn_ver = self.get_svn_revision()
        # print(f"svn_ver: {svn_ver}")


        # subprocess.run('cd ./配置表  /tools/py37/py37.exe __export.py -p client -f compact_json', check=True)
        self.build_Game_config()
        # Modify AdConfig
        self.modify_ad_config(channel, platformID, appid, app_secret, 
                             reward_video, interstitial, banner, game_ver, svn_ver, game_name, game_id)
        
        self.copy_diff_files(platform_key)
        
        # Create local builder.json
        #self.create_local(actual_platform, plat_name, self.build_path)
        
        # Create build directory
        os.makedirs(os.path.join(self.build_path, build_name), exist_ok=True)

        #print(f"Build directory created: {os.path.join(self.build_path, build_name)}")

        if plat_type not in [self.platTypeWeb, self.platTypeSec]:
            self.create_settings(settings_name, appid, remote_root)
        
        # Run CocosCreator build
        build_cmd = [
            self.COCOS,
            "--path", self.project_path,
            "--build",
            f"buildPath={self.build_path};platform={actual_platform};debug=false;"
            f"sourceMaps=false;inlineSpriteFrames={inline_sprite_frames};"
            f"orientation={orientation};startScene={self.start_scene};"
            "autoCompile=false;md5Cache=true",
        
        ]
        print("build_cmd: ", build_cmd)
        subprocess.run(build_cmd, check=True)

        self.after_build(platformName, build_name, channel, platform, svnVer)
        
        # if plat_type not in [self.platTypeWeb, self.platTypeSec]:
        #     # Copy and modify files
        #     shutil.copy(
        #         os.path.join(self.build_path, "index.js"),
        #         os.path.join(self.build_path, build_name, "index.js")
        #     )
            
        #     if plat_type == self.platTypeBl:
        #         self.modify_gamejs_bili(build_name)
        #         self.bili_extra(appid, build_name, ver)
        #     else:
        #         self.modify_gamejs(build_name)
            
        self.create_release(appid, build_name, file_name, plat_type,game_ver)
        # elif plat_type == self.platTypeSec:
        #     self.create_web_release(appid, build_name, file_name)
        # else:
        #     self.create_web_release(appid, build_name, file_name)
        
        print(f"\n\nfileName: {file_name}\n\n")
    
    def after_build(self, platformName, build_name, channel, platform, svnVer):
        print("after_build", platformName, channel, platform, svnVer)
        if platform == self.platTypeWeb:
            print("modify_platTypeWeb")
        
        elif platform == self.platTypeDy:
            print("modify_platTypeDy")

        elif platform == self.platTypeWx:
            print("modify_platTypeWx")

        elif platform == self.platTypeKs:
            print("modify_platTypeKs")

        elif platform == self.platTypeSec:
            print("modify_platTypeSec")

        elif platform == self.platTypeBl:
            print("modify_platTypeBl")

        elif platform == self.platTypeBd:
            print("modify_platTypeBd")
    
    
    def modify_ad_config(self, channel, platformID, appid, app_secret, 
                        reward_videos, interstitials, banners, game_ver, svn_ver, game_name, game_id):
            
        print("modify_ad_config", channel, platformID, appid, app_secret, self.config_path)
        config = {
            "GameName": game_name,
            "GameID": game_id,
            "Banner": [{"id": bid, "interval": 30} for bid in banners.split(",")] if banners != "test" else [],
            "RewardVideos": reward_videos.split(",") if reward_videos != "test" else [],
            "Interstitial": interstitials.split(",") if interstitials != "test" else [],
            "AppId": appid,
            "AppSecrect": app_secret,
            "Channel": channel,
            "platformType": platformID,
            "gameVer": game_ver,
            "svnVer": svn_ver
        }
        

        with open(self.config_path, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=4, ensure_ascii=False)
    
    def copy_diff_files(self, platform_key):
        copy_root = os.path.join(self.copy_root,platform_key) 
        copy_files = self.copy_files

        # 确保copy_root存在
        if not os.path.exists(copy_root):
            print(f"错误：源目录不存在 - {copy_root}")
            return
        # 处理每个文件
        success_count = 0
        skip_count = 0
        
        for file_path in copy_files:
            filename = os.path.basename(file_path)

            # 构建源路径和目标路径
            src_path = os.path.join(copy_root, filename)
            dst_path = file_path
            
            # 确保源文件存在
            if not os.path.exists(src_path):
                print(f"警告：源文件不存在 - {src_path}")
                skip_count += 1
                continue
            
            # 确保目标目录存在
            os.makedirs(os.path.dirname(dst_path), exist_ok=True)
            
            try:
                # 复制文件（保留元数据）
                shutil.copy2(src_path, dst_path)
                success_count += 1
                print(f"复制成功: {src_path} -> {dst_path}")
            except Exception as e:
                print(f"复制失败: {src_path} -> {dst_path}")
                print(f"错误详情: {str(e)}")
                skip_count += 1
        
        print("\n操作完成!")
        print(f"成功复制: {success_count} 个文件")
        print(f"跳过复制: {skip_count} 个文件")
    

    def build_Game_config(self):
        success = run_batch_safely("__export.bat", "配置表")
        if success:
            print("生成游戏配置成功！")
        else:
            print("生成游戏配置失败！")
        


    def create_local(self, actual_platform, platform, build_path):
        config = {
            "platform": platform,
            "actualPlatform": actual_platform,
            "template": "link",
            "buildPath": "./build",
            "debug": False,
            "sourceMaps": False,
            "embedWebDebugger": False,
            "previewWidth": "1280",
            "previewHeight": "720",
            "useDebugKeystore": "true",
            "keystorePath": "",
            "keystorePassword": "",
            "keystoreAlias": "",
            "keystoreAliasPassword": "",
            "apiLevel": "",
            "appABIs": [],
            "vsVersion": "auto",
            "buildScriptsOnly": "false"
        }
        
        os.makedirs(self.local_path, exist_ok=True)
        with open(os.path.join(self.local_path, "builder.json"), 'w') as f:
            json.dump(config, f, indent=4)
    
    def create_settings(self, settings_name, appid, remote_root):
        config = {
            "appid": appid,
            "orientation": "portrait",
            "separate_engine": False,
            "REMOTE_SERVER_ROOT": remote_root,
            "subContext": "paihangbang",
            "startSceneAssetBundle": False
        }
        
        os.makedirs(self.settings_path, exist_ok=True)
        with open(os.path.join(self.settings_path, settings_name), 'w') as f:
            json.dump(config, f, indent=4)
    
    def modify_gamejs(self, build_name):
        print("modify_gamejs", build_name)
        # gamejs_path = os.path.join(self.build_path, build_name, "game.js")
        # if not os.path.exists(gamejs_path):
        #     return
            
        # with open(gamejs_path, 'r', encoding='utf-8') as f:
        #     lines = f.readlines()
        
        # # Insert require statement after line 2
        # if len(lines) >= 2:
        #     lines.insert(2, "require('./index');\n\n")
        
        # with open(gamejs_path, 'w', encoding='utf-8') as f:
        #     f.writelines(lines)
    
    def modify_gamejs_bili(self, build_name):
        gamejs_path = os.path.join(self.build_path, build_name, "game.js")
        if not os.path.exists(gamejs_path):
            return
            
        with open(gamejs_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        new_content = [
            "require('./index');\n",
            "require('blapp-adapter-v2.4-cocos.js');\n\n",
            "window.boot();\n",
            "if(bl){bl.launchSuccess()};\n"
        ]
        
        # Insert at line 2
        if len(lines) >= 2:
            lines[2:2] = new_content
        
        with open(gamejs_path, 'w', encoding='utf-8') as f:
            f.writelines(lines)
    
    def bili_extra(self, appid, build_name, ver):
        # Copy adapter file
        src_adapter = os.path.join(self.build_path, "blapp-adapter-v2.4-cocos.js")
        dst_adapter = os.path.join(self.build_path, build_name, "blapp-adapter-v2.4-cocos.js")
        if os.path.exists(src_adapter):
            shutil.copy(src_adapter, dst_adapter)
        
        # Create game.json
        game_json = {
            "deviceOrientation": "portrait",
            "networkTimeout": {
                "request": 5000,
                "connectSocket": 5000,
                "uploadFile": 5000,
                "downloadFile": 5000
            },
            "subpackages": [],
            "appId": appid,
            "version": ver
        }
        
        with open(os.path.join(self.build_path, build_name, "game.json"), 'w') as f:
            json.dump(game_json, f, indent=4)
    
    def find_import_native_dirs(self, root_path):
        """
        查找所有包含import和native子目录的目录
        :param root_path: 根目录路径
        :return: 包含(import_dir, native_dir)元组的列表
        """
        target_dirs = []
        
        # 遍历根目录下的所有子目录
        for entry in os.scandir(root_path):
            if entry.is_dir():
                # 检查该目录下是否有import和native子目录
                import_dir = os.path.join(entry.path, 'import')
                native_dir = os.path.join(entry.path, 'native')
                
                if os.path.isdir(import_dir):
                    target_dirs.append((import_dir))
                if os.path.isdir(native_dir):
                    target_dirs.append((native_dir))
        
        return target_dirs
    
    def process_target_dirs(self, dir):
        """
        处理指定的import和native目录
        :param import_dir: import目录路径
        :param native_dir: native目录路径
        """
        print(f"Processing import directory: {dir}")
        for root, dirs, files in os.walk(dir):
            for file in files:
                original_path = os.path.join(root, file)
                try:
                    # 应用重定向规则
                    new_path = redirect_url(original_path)
                    # 如果路径被修改，重命名文件
                    if new_path != original_path:
                        os.rename(original_path, new_path)
                        # print(f"  Renamed: {original_path} -> {new_path}")

                        # 如果是图片文件，进行压缩
                        #if new_path.lower().endswith('.png'):
                        #   compressed_data = compress_png_with_optipng(new_path)
                            # if compressed_data:
                            #     # 写入压缩后的图片
                            #     with open(new_path, 'wb') as f:
                            #         f.write(compressed_data)
                                    #print(f"Compressed PNG: {original_path} -> {new_path}")
                        
                        # elif new_path.lower().endswith(('.jpg', '.jpeg')):
                        #     compressed_data = compress_jpg(new_path)
                        #     if compressed_data:
                        #         # 写入压缩后的图片
                        #         with open(new_path, 'wb') as f:
                        #             f.write(compressed_data)
                                #print(f"Compressed JPG: {original_path} -> {new_path}")
                except Exception as e:
                    print(f"Error processing {original_path}: {str(e)}")
        

    ## 路径加密
    def process_directory(self, appid, build_name,):
        app_name = f"{appid}-{build_name}"
        release_build_path = os.path.join(self.release_path, app_name)
        remote_dst = os.path.join(release_build_path, "remote")
        g_dst = os.path.join(release_build_path, build_name + '/assets')
        
        sub_dst = os.path.join(release_build_path, build_name + '/subpackages')

        target_dirs = self.find_import_native_dirs(g_dst)
        remote_dirs = self.find_import_native_dirs(remote_dst)
        for dir in target_dirs:
            self.process_target_dirs(dir)
        
        for dir in remote_dirs:
            self.process_target_dirs(dir)
            
        if os.path.exists(sub_dst):
            sub_dirs = self.find_import_native_dirs(sub_dst)
            for dir in sub_dirs:
                self.process_target_dirs(dir)
        

    
    def create_release(self, appid, build_name, file_name, plat_type,game_ver):
        app_name = f"{appid}-{build_name}"
        release_build_path = os.path.join(self.release_path, app_name)
        temp_build_path = os.path.join(self.build_path, build_name)
        
        os.makedirs(self.release_path, exist_ok=True)
        
        if os.path.exists(release_build_path):
            shutil.rmtree(release_build_path)
        
        if plat_type == self.platTypeBl:
            dst_path = os.path.join(release_build_path, "biligame")
            shutil.copytree(temp_build_path, dst_path)
            remote_src = os.path.join(dst_path, "remote")
        else:
            dst_path = os.path.join(release_build_path, build_name)
            shutil.copytree(temp_build_path, dst_path)
            remote_src = os.path.join(dst_path, "remote")
        
        # Compress remote folder
        if os.path.exists(remote_src):
            remote_dst = os.path.join(release_build_path, "remote")
            shutil.move(remote_src, remote_dst)

            # self.process_directory(appid, build_name)

            self.compress_folder(remote_dst, os.path.join(release_build_path, f"remote_{game_ver}.zip"))
            # self.compress_folder(remote_dst, os.path.join(release_build_path, f"remote.zip"))
            shutil.rmtree(remote_dst)
        
        # Write filename
        with open(os.path.join(release_build_path, "fileName"), 'w') as f:
            f.write(file_name)
    
    def create_web_release(self, appid, build_name, file_name):
        app_name = f"{appid}-{build_name}"
        release_build_path = os.path.join(self.release_path, app_name)
        temp_build_path = os.path.join(self.build_path, build_name)
        
        os.makedirs(self.release_path, exist_ok=True)
        
        if os.path.exists(release_build_path):
            shutil.rmtree(release_build_path)
        
        shutil.copytree(temp_build_path, os.path.join(release_build_path, build_name))
        
        # Compress web-mobile folder
        web_mobile_path = os.path.join(release_build_path, build_name, "web-mobile")
        if os.path.exists(web_mobile_path):
            
            self.compress_folder(
                web_mobile_path,
                os.path.join(release_build_path, "web-mobile.zip")
            )
        
        # Write filename
        with open(os.path.join(release_build_path, "fileName"), 'w') as f:
            f.write(file_name)
    
    def compress_folder(self, folder_path, output_path, compression_type='zip'):
        """Compress folder using Python libraries"""
        try:
            if compression_type == 'zip':
                with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                    for root, dirs, files in os.walk(folder_path):
                        for file in files:
                            file_path = os.path.join(root, file)
                            arcname = os.path.relpath(file_path, folder_path)
                            zipf.write(file_path, arcname)
            elif compression_type in ['tar', 'tar.gz']:
                mode = 'w:gz' if compression_type == 'tar.gz' else 'w'
                with tarfile.open(output_path, mode) as tar:
                    tar.add(folder_path, arcname=os.path.basename(folder_path))
            else:
                raise ValueError(f"Unsupported compression type: {compression_type}")
            
            print(f"Successfully created {output_path}")
            return True
        except Exception as e:
            print(f"Compression failed: {e}")
            return False
    
    def clean(self, build_name):
        build_dir = os.path.join(self.build_path, build_name)
        if os.path.exists(build_dir):
            shutil.rmtree(build_dir)
    
    def get_current_time(self):
        now = datetime.now()
        return now.strftime("%Y%m%d_%H%M%S")
    
    # Platform-specific build methods
    # 抖音平台 build
    def build_dy(self, channel): 
        self.build_py('dy', channel, self.platTypeDy, 1)

    # 微信平台 build
    def build_wechat(self, channel):
        self.build_py('wechat', channel, self.platTypeWx, 1)

    # 快手平台 build
    def build_ks(self, channel):
        self.build_py('ks', channel, self.platTypeKs, 1)
    
    # Bilibili平台 build
    def build_bili(self, channel):
        self.build_py('bili', channel, self.platTypeBl, 1)

    # 
    def build_sec(self, channel):
        self.build_py('bili', channel, self.platTypeSec, 1)
    
    # 百度平台 build
    def build_baidu(self,channel):
        self.build_py('baidu', channel, self.platTypeBd, 1)
    
    # Web平台 build
    def build_web(self, channel):
        self.build_py('web', channel, self.platTypeWeb, 1)

if __name__ == "__main__":
    try:
        mgr = ConfigMgr()
        mgr.run()
    except Exception as e:
        print(f"程序运行出错: {e}")
        input("按任意键退出...")