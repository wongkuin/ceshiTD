#encoding=utf-8

# Need to export the public configuration file (client, server needs) 需要导出的公共配置文件(客户端,服务器都需要)
EXPORT_FILES = [
]

# Additional configuration files that the client needs to export (only the client needs) 客户端额外需要导出的额外配置文件(仅客户端需要)
EXPORT_CLIENT_ONLY = [
]

# Server-side need to export the configuration file (only the server needs) 服务器端额外需要导出的配置文件(仅服务器需要)
EXPORT_SERVER_ONLY = [
]

# do not modify the following

import os
import platform
import traceback
import shutil
import sys
import argparse

exportscript = 'tools/proton.py'     
pythonpath = 'tools\\py37\\py37.exe ' if platform.system() == 'Windows' else 'python3 '

class ExportError(Exception):
  pass

def export(filelist, format, sign, outfolder, suffix, schema, outi18n ='./i18n/', langs = ['zh', 'en']):
  if len(filelist) == 0: return
  cmd = r' -p "' + ','.join(filelist) + '" -f ' + outfolder + ' -e ' + format + ' -s ' + sign + ' -l ' + outi18n  + ' -g "' + ','.join(langs) + '"' + ' -r ' + './scr/'
  if suffix:
    cmd += ' -t ' + suffix
  if schema:
    cmd += ' -c ' + schema
  cmd = pythonpath + exportscript + cmd
  code = os.system(cmd)
  if code != 0:
    raise ExportError('export excel fail, please see print')

def codegenerator(schema, outfolder, namespace, suffix):
  if os.path.exists(schema):
    cmd = 'tools\CSharpGeneratorForProton\CSharpGeneratorForProton.exe ' + '-n ' + namespace + ' -f ' + outfolder + ' -p ' + schema
    if suffix:
      cmd += ' -t ' + suffix 
    code = os.system(cmd)
    os.remove(schema)      
    if code != 0:
      raise ExportError('codegenerator fail, please see print')
        
def exportserver(format='json'):
    exportCurrentDir('server', format)
    
def exportclient(format='compact_json'):
    #export(EXPORT_FILES + EXPORT_CLIENT_ONLY, format, 'client', 'config_client', '', None)
    exportCurrentDir('client', format)

# def exportCurrentDir():
#   l = []
#   for filename in os.listdir("./"):
#     if filename.startswith("~"): continue
#     if filename.endswith(".xlsm") or filename.endswith(".xlsx"):
#       l.append(filename)
  
#   export(l, 'json', 'client', './config/', '', './schema.json')
#   # codegeneratorTS('./schema.json','../assets/script/config/DataDef.ts','../assets/script/config/ConfigMgr.ts')
#   export(l, 'compact_json', 'client', '../assets/resources/config/', '', None)
#   os.remove('./schema.json')

def copyFile(src_file, dst):
    # 检查源文件是否存在
    if not os.path.exists(src_file):
        raise FileNotFoundError(f"源文件不存在: {src_file}")
    # 如果目标是目录，则保持原文件名
    if os.path.isdir(dst):
        dst = os.path.join(dst, os.path.basename(src_file))
    
    # 确保目标目录存在
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    try:
        with open(src_file, 'rb') as src:
            with open(dst, 'wb') as dst:
                dst.write(src.read())
                print("文件复制成功！", src_file, dst)
    except Exception as e:
        raise RuntimeError(f"复制文件时出错: {e}", src_file, dst)

    

def exportCurrentDir(platform_type='client', export_format='compact_json'):
    fileRoot = "./xml/"
    l = []
    for filename in os.listdir(fileRoot):
        if filename.startswith("~"): 
            continue
        if filename.endswith(".xlsm") or filename.endswith(".xlsx"):
            l.append(os.path.join(fileRoot, filename) )
    
    if platform_type == 'server':
        export(l, export_format, 'server', './config/', '', './schema.json')
        export(l, export_format, 'server', './config_server/', '', './schema.json')
    else:
        export(l, export_format, 'client', './config/', '', './schema.json')
        export(l, export_format, 'client', '../assets/Module/Config/', '', './schema.json')
        copyFile('./scr/ConfigMgr.ts', '../assets/Script/config/ConfigMgr.ts')
        copyFile('./scr/DataDef.ts', '../assets/Script/config/DataDef.ts')
        copyFile('./scr/EnumDef.ts', '../assets/Script/config/EnumDef.ts')
        os.remove('./scr/ConfigMgr.ts')
        os.remove('./scr/DataDef.ts')
        os.remove('./scr/EnumDef.ts')
    
    if os.path.exists('./schema.json'):
        os.remove('./schema.json')

# def codegeneratorTS(schema, dataDef,configDef):
#   if os.path.exists(schema):
#     cmd = 'tools\TSGenerator\TSGenerator.exe ' + ' -f ' + dataDef + ' -c ' + configDef  +  ' -p ' + schema
#     code = os.system(cmd)
#     os.remove(schema)
#     if code !=0:
#       raise ExportError('codegenerator fail, please see print')


def parse_args():
    parser = argparse.ArgumentParser(description='Excel导出工具')
    parser.add_argument('-p', '--platform', choices=['client', 'server'], 
                       default='client', help='导出平台: client或server')
    parser.add_argument('-f', '--format', choices=['json', 'compact_json', 'erlang'], 
                       default='compact_json', help='导出格式: json, compact_json 或 erlang')
    return parser.parse_args()

def main():
    try:
        args = parse_args()
        if args.platform == 'server':
            print(f"正在导出服务器配置，格式: {args.format}")
            exportserver(args.format)
        else:
            print(f"正在导出客户端配置，格式: {args.format}")
            exportclient(args.format)
            
        print("所有操作完成!")
        return 0
    except ExportError as e:
        print(e)
        print("发生错误，请查看日志，按回车键退出")
        input()
        return 1
    except Exception as e:
        traceback.print_exc()
        print("发生错误，请查看日志，按回车键退出")
        input()
        return 1
    
if __name__ == '__main__':
    sys.exit(main())
