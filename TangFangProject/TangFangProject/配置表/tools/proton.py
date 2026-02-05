#encoding=utf-8
'''
Copyright 2016 YANG Huan (sy.yanghuan@gmail.com)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
'''
import sys        

if sys.version_info < (3, 0):
  print('python version need more than 3.x')
  sys.exit(1)
    
import os
import string
import collections
import codecs
import getopt
import re
import json
import xml.etree.ElementTree as ElementTree
import xml.dom.minidom as minidom
import xlrd

def fillvalue(parent, name, value, isschema):
  if isinstance(parent, list):
    parent.append(value) 
  else:
    if isschema and not re.match('^_|[a-zA-Z]\w*$', name):
      raise ValueError('%s is a illegal identifier' % name)
    parent[name] = value
    
def getindex(infos, name):
  for index, item in enumerate(infos):
    if item == name:
      return index
  return -1

def getscemainfo(typename, description):
  if isinstance(typename, BindType):
    typename = typename.typename
  return [typename, description] if description else [typename]
        
def getexportmark(sheetName):
  p = re.search('\|[' + string.whitespace + ']*(_|[a-zA-Z]\w+)', sheetName)
  return p.group(1) if p else False

def issignmatch(signarg, sign):
  # print(signarg,' -', sign, sign is None)
  if signarg is None:
    return True
   # 分割sign中的多个签名
  sign_parts = re.split(r'[/\\, :]+', sign.strip())
    
  # 检查是否有任一签名部分在signarg中
  return any(part and (part in signarg) for part in sign_parts)
  #return True if [s for s in re.split(r'[/\\, :]', sign) if s in signarg] else False

def isoutofdate(srcfile, tarfile):
  return not os.path.isfile(tarfile) or os.path.getmtime(srcfile) > os.path.getmtime(tarfile)

def gerexportfilename(root, format_, folder):
  ext = format_
  if format_ == 'compact_json':
    ext = 'json'
  filename = root +  '.' + ext
  return os.path.join(folder, filename)


def splitspace(s):
  print('splitspace',s)
  return re.split(r'[' + string.whitespace + ']+', s.strip())

def buildbasexml(parent, name, value):
  value = str(value)
  if parent.tag == name:
    element = ElementTree.Element(name)
    element.text = value
    parent.append(element)
  else:
    parent.set(name, value)    
            
def buildlistxml(parent, name, list_):
  element = ElementTree.Element(name)
  parent.append(element)
  for v in list_:
    buildxml(element, name[:-1], v)    

def buildobjxml(parent, name, obj):
  element = ElementTree.Element(name)
  parent.append(element)
  
  for k, v in obj.items():
    buildxml(element, k, v)
        
def buildxml(parent, name, value):
  if isinstance(value, int) or isinstance(value, float) or isinstance(value, str):
    buildbasexml(parent, name, value)
      
  elif isinstance(value, list):
    buildlistxml(parent, name, value)
      
  elif isinstance(value, dict):
    buildobjxml(parent, name, value)
            
def savexml(record):
  book = ElementTree.ElementTree()
  book.append = lambda e: book._setroot(e)
  buildxml(book, record.root, record.obj)
  
  xmlstr = ElementTree.tostring(book.getroot(), 'utf-8')
  dom = minidom.parseString(xmlstr)
  with codecs.open(record.exportfile, 'w', 'utf-8') as f:
    dom.writexml(f, '', '  ', '\n', 'utf-8')
      
  print('save %s from %s in %s' % (record.exportfile, record.sheet.name, record.path))
  
def newline(count):
  return '\n' + '  ' * count
  
def tolua(obj, indent = 1):    
  if isinstance(obj, int) or isinstance(obj, float) or isinstance(obj, str):
    yield json.dumps(obj, ensure_ascii = False)
  else:
    yield '{'
    islist = isinstance(obj, list)
    isfirst = True
    for i in obj:
      if isfirst:
        isfirst = False
      else:
        yield ','
      yield newline(indent)
      if not islist:
        k = i
        i = obj[k]
        yield k 
        yield ' = '                
      for part in tolua(i, indent + 1):
        yield part
    yield newline(indent - 1)
    yield '}'
    
def toycl(obj, indent = 0):
  islist = isinstance(obj, list)
  for i in obj:
    yield newline(indent)  
    if not islist:
      k = i
      i = obj[k]
      yield k 
    if isinstance(i, int) or isinstance(i, float) or isinstance(i, str): 
      if not islist:
        yield ' = '
      yield json.dumps(i, ensure_ascii = False)
    else:
      if not islist:
        yield ' '
      yield '{'
      for part in toycl(i, indent + 1):
        yield part
      yield newline(indent)  
      yield '}'     

def exportexcel(context):
  Exporter(context).export()
  print("export finsish successful!!!")


#------------------erlang --------------------
def toerlang(obj, indent=0, is_record=False, record_name=None,i18n_keys=None):
    """将Python对象转换为Erlang格式"""

    if i18n_keys is None:
        i18n_keys = {}

    def format_value(v):
        """智能格式化单个值"""
        if isinstance(v, (int, float)):
            return str(v)
        elif isinstance(v, str):
            if v in i18n_keys:
                return f'<<"{i18n_keys[v]}">>'
            # 自动识别数字字符串
            if v.replace('.', '', 1).isdigit() or (v.startswith('-') and v[1:].replace('.', '', 1).isdigit()):
                return v
            return f'<<"{v}">>'
        elif isinstance(v, bool):
            return 'true' if v else 'false'
        return 'undefined'
    
    # print("xxxxxx",obj, isinstance(obj, (int, float)))
    if isinstance(obj, (int, float)):
        yield str(obj)
    elif isinstance(obj, str):
        # 处理多语言文本
        if obj in i18n_keys:
            yield f'<<"{i18n_keys[obj]}">>'  # 使用多语言key
        else:
            yield f'<<"{obj}">>'  # 普通字符串
    elif isinstance(obj, bool):
        yield 'true' if obj else 'false'
    elif isinstance(obj, list):
        if not obj:
            yield "[]"
        else:
            # print( obj)

            is_2d = all(isinstance(x, (list, tuple)) for x in obj)
            is_2d_tuples = all(isinstance(x, (list, tuple)) and len(x) == 2 for x in obj)
                           
            # 检查是否是二维数组
            if is_2d and not is_2d_tuples:
                # 处理纯二维数组 [[a,b,c], [d,e,f]]
                yield "["
                for i, row in enumerate(obj):
                    if i > 0:
                        yield ","
                    yield "[" + ",".join(format_value(x) for x in row) + "]"
                yield "]"
            elif is_2d_tuples:
                # 处理元组数组 [[k,v], [k,v]] - 保持原格式
                yield "["
                for i, (k, v) in enumerate(obj):
                    if i > 0:
                        yield ","
                    yield "{" + format_value(k) + "," + format_value(v) + "}"
                yield "]"
            else:
                yield "[\n"
                is_first = True
                for item in obj:
                    if is_first:
                        is_first = False
                    else:
                        yield ",\n"
                    yield "  " * (indent + 1)
                    for part in toerlang(item, indent + 1):
                        yield part
                yield "\n"
                yield "  " * indent
                yield "]"
    elif isinstance(obj, dict):
        if is_record and record_name:
            yield f"#{record_name}{{\n"
            is_first = True
            for k, v in obj.items():
                if is_first:
                    is_first = False
                else:
                    yield ",\n"
                yield "  " * (indent + 1)
                # 处理字段名(移除_i18n后缀)
                field_name = k[:-5] if k.endswith('_i18n') else k
                yield f"{field_name} = "
                for part in toerlang(v, indent + 1, False, None, i18n_keys):
                    yield part
                
             
            yield "\n"
            yield "  " * indent
            yield "}"
        else:
            yield "#{\n"
            is_first = True
            for k, v in obj.items():
                if is_first:
                    is_first = False
                else:
                    yield ",\n"
                yield "  " * (indent + 1)
                yield f"{k} => "
                for part in toerlang(v, indent + 1):
                    yield part
            yield "\n"
            yield "  " * indent
            yield "}"
    else:
        yield 'undefined'

def generate_erlang_record_definition(record_name, schema, descriptions=None,class_comment=None):
    """生成带详细注释的Erlang记录定义"""
    fields = []
    # 处理类注释
    class_comment = normalize_comment(class_comment) if class_comment else ""
    # descriptions= normalize_comment(descriptions) if descriptions else ""
    # print("descriptions ====", descriptions)

    def get_field_description(field_name, field_schema):
        """获取字段描述"""
        if descriptions and field_name in descriptions:
            return descriptions[field_name]
        if isinstance(field_schema, list) and len(field_schema) > 1 and isinstance(field_schema[1], str):
            return field_schema[1]
        return "无描述"
    
    def process_field_type(field_schema):
        """处理字段类型"""
        # print("field_schema",field_schema)
        if isinstance(field_schema, list):
            if len(field_schema) > 0:
                if isinstance(field_schema[0], list):
                    return "list()"
                return process_basic_type(field_schema[0])
        elif isinstance(field_schema, dict):
            # print("field_schema",field_schema)
            return "#{}"
        return process_basic_type(field_schema)
    
    def process_basic_type(type_str):
        """处理基础类型"""
        type_map = {
            'int': 'integer()',
            'double': 'float()',
            'float': 'float()',
            'string': 'binary()',
            'bool': 'boolean()',
            'obj': '#{}',
            'list': 'list()'
        }
        if type_str.startswith('list:'):
            type_str = 'list'
        if type_str.endswith('[]'):
            type_str = 'list'
        # print("type_str",type_str, type_map.get(str(type_str).lower(), 'any()'))
        return type_map.get(str(type_str).lower(), 'any()')
    
    
    if isinstance(schema, dict):

        # 构建记录定义
        record_def = []
        # print("record_name",class_comment)
        # 添加类级别注释
        if class_comment:
            record_def.append(f"%% @doc {class_comment}")
        else:
            record_def.append(f"%% @doc {record_name}数据记录")
        record_def.append(f"-record({record_name}, {{")
        for field, field_schema in schema.items():
            # 处理字段名(移除_i18n后缀)
            display_field = field[:-5] if field.endswith('_i18n') else field

            field_type = process_field_type(field_schema)
            description = get_field_description(field, field_schema)
            description = normalize_comment(description) if description else ""
            # 
            # 添加多语言标记说明
            if field.endswith('_i18n'):
                description += " (多语言字段)"
            
            # 设置默认值
            default_value = ""
            if field_type == 'integer()':
                default_value = " = 0"
            elif field_type == 'float()':
                default_value = " = 0.0"
            elif field_type == 'binary()':
                default_value = " = <<>>"
            elif field_type == 'boolean()':
                default_value = " = false"
            elif field_type == 'list()':
                default_value = " = []"
            elif field_type == '#{}':
                default_value = " = #{}"
            
            
            
            fields.append(
                f"    {field}{default_value} :: {field_type}, %% {description}"
            )
            fields.append(
            f"    {display_field}{default_value} :: {field_type}, %% {description}"
            )
            record_def.append(
            f"    {field}{default_value} :: {field_type}, %% {description}"
            )
    
    record_def.append("}).")
    record_def.append("")
    
    return "\n".join(record_def)
    
    return record_def
def export_erlang(record):
    """导出Erlang格式数据"""
    if not record.obj:
        return None

    i18n_keys = {}
    if hasattr(record, 'context') and record.context and hasattr(record.context, 'i18n_data'):
        for key, info in record.context.i18n_data.get('keys', {}).items():
            if info.get('value'):
                i18n_keys[info['value']] = key
    
    class_comment = record.sheet.name
    if '|' in class_comment:  # 如果有导出标记，去除标记部分
        class_comment = class_comment.split('|')[0].strip()

    descriptions = {}
    if record.sheet and record.sheet.nrows > 0:
        description_row = record.sheet.row_values(0)
        name_row = record.sheet.row_values(2) if record.sheet.nrows > 2 else []
        for i, name in enumerate(name_row):
            if i < len(description_row):
                descriptions[name.strip()] = description_row[i].strip()
    
    # 确保输出目录存在
    folder = getattr(record, 'context', None) and record.context.folder or os.path.dirname(record.exportfile)
    os.makedirs(folder, exist_ok=True)
    
    # 生成记录名称
    record_name = "data_" + (record.item or record.root.lower())
    
    # 导出数据文件(.erl)
    module_name = "" + (record.item or record.root.lower())
    erl_filename = os.path.join(folder, f"{module_name}.erl")
    
    with codecs.open(erl_filename, 'w', 'utf-8') as f:
        f.write("%%--- coding:latin-1 ---\n")
        f.write(f"-module({module_name}).\n")
        f.write("-export([get_list/0, get/1]).\n")
        f.write('-include("data_def.hrl").\n\n')
        
        # 导出ID列表
        if isinstance(record.obj, list):
            id_list = [str(item.get('id', 0)) for item in record.obj if isinstance(item, dict)]
            f.write("%% 获取所有ID列表\n")
            f.write("get_list() -> \n    [")
            f.write(",".join(id_list))
            f.write("].\n\n")
            
            # 导出每个记录
            f.write("%% 获取数据\n")
            for item in record.obj:
                if not isinstance(item, dict):
                    continue
                
                item_id = item.get('id', 0)
     
                f.write(f"get({item_id}) -> ")
            
                erl_data = "".join(toerlang(
                    item, 
                    indent=1, 
                    is_record=True, 
                    record_name=record_name,
                    i18n_keys=i18n_keys
                ))
                f.write(erl_data)
                f.write(";\n")
            
            f.write("get(_N) -> false.\n")
        else:
            # 配置表处理
            f.write("get_list() -> [].\n\n")
            f.write("get(Key) ->\n    case Key of\n")
            for key, value in record.obj.items():
                # print("record ---",item)
                f.write(f"        {key} -> ")
                erl_data = "".join(toerlang(value, 2))
                f.write(erl_data)
                f.write(";\n")
            f.write("        _ -> undefined\n    end.\n")
    
    print(f'save Erlang data: {erl_filename}')
    
    # 返回记录定义
    if record.schema:
        record_name = "data_" + (record.item or record.root.lower())
        return (record_name, generate_erlang_record_definition(
            record_name, 
            record.schema,
            descriptions,
            class_comment
        ))
    return None


def save_combined_hrl(records, output_folder):
    """将所有记录定义保存到统一的data_def.hrl文件"""
    hrl_content = [
        "%%----------------------------------------------------------------------",
        "%% @author auto-generated",
        "%% @doc Auto-generated from Excel - Combined Records",
        "%%----------------------------------------------------------------------",
        "",
        "-ifndef(DATA_DEF_HRL).",
        "-define(DATA_DEF_HRL, true).",
        ""
    ]
    
    # 收集所有记录定义
    record_defs = []
    for record in records:
        if record.schema:
            record_name = "data_" + (record.item or record.root.lower())
             # 获取类描述
            class_comment = getattr(record, 'sheet', None) and record.sheet.name or ""
            if '|' in class_comment:  # 如果有导出标记，去除标记部分
                class_comment = class_comment.split('|')[0].strip()

            # 获取字段描述
            descriptions = {}
            if hasattr(record, 'sheet') and record.sheet and record.sheet.nrows > 0:
                description_row = record.sheet.row_values(0)
                name_row = record.sheet.row_values(2) if record.sheet.nrows > 2 else []
                for i, name in enumerate(name_row):
                    if i < len(description_row):
                        descriptions[name.strip()] = description_row[i].strip()

            # 生成记录定义
            record_def = generate_erlang_record_definition(
                record_name, 
                record.schema,
                descriptions=descriptions,
                class_comment=class_comment
            )
            record_defs.append(record_def)
    
    # 添加所有记录定义
    hrl_content.extend(record_defs)
    
    # 添加文件结尾
    hrl_content.extend([
        "",
        "-endif."
    ])
    
    # 写入文件
    hrl_filename = os.path.join(output_folder, "data_def.hrl")
    with codecs.open(hrl_filename, 'w', 'utf-8') as f:
        f.write("\n".join(hrl_content))
    
    print(f'save combined Erlang record definition: {hrl_filename}')

#------------------end erlang --------------------


def normalize_comment( comment):
    """将多行注释转换为单行"""
    if not comment:
        return ""
    # 替换所有换行符和连续空白为单个空格
    return ' '.join(line.strip() for line in str(comment).splitlines() if line.strip())

class BindType:
  def __init__(self, type_):
    self.typename = type_
      
  def __eq__(self, other):
    return self.typename == other
    
class Record:
  def __init__(self, path, sheet, exportfile, root, item, obj, exportmark, context=None):
    self.path = path 
    self.sheet = sheet 
    self.exportfile = exportfile 
    self.root = root 
    self.item = item
    self.setobj(obj)
    self.exportmark = exportmark
    self.context = context  # 添加context属性

  def setobj(self, obj):  
    self.schema = obj[0] if obj else None
    self.obj = obj[1] if obj else None
        
class Constraint:
  def __init__(self, mark, filed):
    self.mark = mark
    self.field = filed     
        
class Exporter:
  # 添加多语言配置
  i18n_sheet_titles =('key', 'zh')
  configsheettitles = ('name', 'value', 'type', 'sign', 'description')
  spacemaxrowcount = 3
  
  def __init__(self, context):
    self.context = context
    self.records = []
    self.constraints = []
    self.i18n_data = {
            'keys': {},         # 存储键到文本的映射
            'translations': {}  # 按语言存储翻译文本
        }
    self.i18n_sheet_titles = self.context.i18n_sheet_titles #('key', 'zh-CN', 'en-US', 'ja-JP')
    self.enum_definitions = []  # 存储所有枚举定义
  
  def gettype(self, type_):
    """改进的类型识别方法，支持多种数据结构类型"""
    if not isinstance(type_, str):
        type_ = str(type_)
    
    type_ = type_.strip()
    # print(f'gettype: {type_}')
    # 优先识别多维数组
    if type_.endswith('[][]'):
        base_type = type_[:-4]  # 提取基础类型
        return f'list2d:{self.gettype(base_type)}'

    # 1. 先检查数组类型 (包括元组数组)
    if type_.endswith('[]'):
        element_type = type_[:-2]
        base_type = self.gettype(element_type)  # 递归检查元素类型
        return f'list:{base_type}'  # 返回带元素类型的列表标识
        
    # 2. 检查元组类型 (如 {int,int})
    if type_.startswith('{') and type_.endswith('}'):
        if ';' in type_:  # 对象类型 {a:int;b:string}
            return 'obj'
        elif ',' in type_:  # 元组类型 {int,int}
            types = [t.strip() for t in type_[1:-1].split(',')]
            return f'tuple:{",".join(types)}'
    
    # 3. 基础类型
    if type_ in ('int', 'float', 'string', 'bool', 'double'):
        return type_
    
    # 5. 检查枚举/引用类型 (如 int(item.conf), string(name))
    if re.match(r'^(int|string)\((\w+)\.(\w+)\)$', type_):
        matched = re.match(r'^(int|string)\((\w+)\.(\w+)\)$', type_)
        type_ = BindType(matched.group(1))
        type_.mark = matched.group(2)
        type_.field = matched.group(3)
        return type_
    
    raise ValueError(f"'{type_}' 不是合法的类型定义")

    
  def buildlistexpress(self, parent, type_, name, value, isschema):
    # print(f'buildlistexpress: {name} {type_} {value} {isschema}')
    basetype = type_[:-2]        
    list_ = []
    if isschema:
      self.buildexpress(list_, basetype, name, None, isschema)
      list_ = getscemainfo(list_[0], value)
    else:
      if value == '':
        list_ = []
      else:  
        valuelist = value.strip('[]').split(',')
        for v in valuelist:
            self.buildexpress(list_, basetype, name, v)
  
    fillvalue(parent, name, list_, isschema)     
      
  def buildobjexpress(self, parent, type_, name, value, isschema):
    obj = collections.OrderedDict()
    fieldnamestypes = type_.strip('{}').split(';')
    if isschema:
      for i in range(0, len(fieldnamestypes)):
        fieldtype, fieldname = splitspace(fieldnamestypes[i])
        self.buildexpress(obj, fieldtype, fieldname, None, isschema)
      obj = getscemainfo(obj, value)
    else:
      if value == '':
        obj = collections.OrderedDict()
      else:
        fieldValues = value.strip('{}').split(';')
        for i in range(0, len(fieldnamestypes)):
          if i < len(fieldValues):
            fieldtype, fieldname = splitspace(fieldnamestypes[i])
            self.buildexpress(obj, fieldtype, fieldname, fieldValues[i])

    fillvalue(parent, name, obj, isschema)       
      
  def buildbasexpress(self, parent, type_, name, value, isschema):
    typename = self.gettype(type_) 
    if isschema:
      value = getscemainfo(typename, value)
    else:
      if v.isspace() and typename != 'string':
        return
       
      if value == '':
          # print('value is empty', typename)
          if typename == 'int':
            value = 0
          elif typename == 'double' or typename == 'float':
            value = float(0.0)
          elif typename == 'string':
            value = str('')
          elif typename == 'bool':
            value = False
          elif typename.startswith('list:'):
            value = []
          else:
            value = str('')
      else:
          if typename == 'int':
            value = int(float(value))
          elif typename == 'double' or typename == 'float':
            value = float(value)   
          elif typename == 'string':
            if value.endswith('.0'):          # may read is like "123.0"
              try:
                value = str(int(float(value)))
              except ValueError:
                value = str(value)
            else:            
              value = str(value)
          elif typename == 'bool':
            try:
              value = int(float(value))
              value = False if value == 0 else True 
            except ValueError:
              value = value.lower() 
              if value in ('false', 'no', 'off'):
                value = False
              elif value in ('true', 'yes', 'on'):
                value = True
              else:    
                raise ValueError('%s is a illegal bool value' % value) 
    fillvalue(parent, name, value, isschema)   
    
    if not isschema and isinstance(typename, BindType):
      self.addconstraint(typename.mark, typename.field, (type_, name, value))

  def build_tuple_array(self, parent, type_, name, value, isschema):
    """处理 {int,int}[] 类型数据"""
    # print("build_tuple_array", isschema, type_, name, value)
    if isschema:
        element_type = type_[:-2]  # 去掉[]
        type_info = self.gettype(element_type)
        fillvalue(parent, name, [type_, value], isschema)
    else:
        # 先检查value是否是字符串，如果不是则直接使用
        if isinstance(value, str):
            if not value.strip():
                fillvalue(parent, name, [], isschema)
                return
            
            # 更健壮的解析逻辑
            tuples = []
            # 统一处理分隔符
            value = value.replace(';', ',').replace('，', ',')
            for tuple_str in re.findall(r'\{[^{}]+\}', value.strip('[]')):
                # 提取元组内容并去除空白
                tuple_data = [v.strip() for v in tuple_str[1:-1].split(',')]
                # 尝试转换为数字
                try:
                    tuple_data = [int(v) if '.' not in v else float(v) for v in tuple_data]
                except ValueError:
                    pass  # 保持原始字符串
                tuples.append(tuple_data)
            
            fillvalue(parent, name, tuples, isschema)
        elif isinstance(value, list):
            # 如果value已经是列表形式，直接使用
            fillvalue(parent, name, value, isschema)
        else:
            # 其他情况视为空数组
            fillvalue(parent, name, [], isschema)
  
  # 添加处理二维数组的方法
  def build_2d_array(self, parent, type_, name, value, isschema):
    """处理 int[][] 或 {int,int}[][] 类型"""
    element_type = type_[:-4]  # 去掉[][]后缀
    base_type = self.gettype(element_type)
    if isschema:
        # element_type = type_[:-4]
        # type_info = self.gettype(element_type)
        # print("build_2d_array", type_, element_type, type_info)
        fillvalue(parent, name, [type_,  value], isschema)
    else:
        # 解析类似 [[1,2],[3,4]] 的数据
        array = []
        for outer in re.findall(r'\[[^\[\]]+\]', value.strip('[]')):
            inner = []
            for item in outer.strip('[]').split(','):
                item = item.strip()
                # 根据类型转换元素值
                if base_type == 'int':
                    try:
                        inner.append(int(float(item)))  # 先转float再转int，处理"1.0"情况
                    except ValueError:
                        inner.append(0)
                elif base_type == 'float' or base_type == 'double':
                    try:
                        inner.append(float(item))
                    except ValueError:
                        inner.append(0.0)
                elif base_type == 'string':
                    inner.append(str(item))
                elif base_type == 'bool':
                    if item.lower() in ('true', 'yes', '1'):
                        inner.append(True)
                    else:
                        inner.append(False)
                else:  # 其他类型保持原样
                    inner.append(item)
            array.append(inner)
        fillvalue(parent, name, array, isschema)

  def _preprocess_tuple_array(self, value):
    """预处理 {int,int}[] 格式的数据"""
    if not isinstance(value, str):
        return value
        
    # 匹配 [{x,y},{a,b},...] 格式
    if re.match(r'^\s*\[\s*\{[^{}]+\}(?:\s*,\s*\{[^{}]+\})*\s*\]\s*$', value):
        tuples = []
        for tuple_str in re.findall(r'\{[^{}]+\}', value.strip('[]')):
            tuple_data = [v.strip() for v in tuple_str[1:-1].split(',')]
            try:
                tuple_data = [int(x) if x.isdigit() else float(x) for x in tuple_data]
            except ValueError:
                tuple_data = [x for x in tuple_data]  # 保持原始字符串
            tuples.append(tuple_data)
        return tuples
    return value

  def buildexpress(self, parent, type_, name, value, isschema = False):
    #### 处理数据 对象
    # if not isschema:
    #     value = self._preprocess_tuple_array(value)

    typename = self.gettype(type_)
    # print("buildexpress", typename, type_, name, parent)
    # 1. 处理二维数组类型
    if isinstance(typename, str) and typename.startswith('list2d:'):
        self.build_2d_array(parent, type_, name, value, isschema)
    # 2. 处理元组数组 (新增)
    elif isinstance(typename, str) and typename.startswith('list:tuple:'):
        self.build_tuple_array(parent, type_, name, value, isschema)
    elif typename.startswith('tuple:'):  # 单个元组
        self.build_single_tuple(parent, type_, name, value, isschema)
    elif typename.startswith('list:'): #typename == 'list':
      self.buildlistexpress(parent, type_, name, value, isschema)
    
    elif typename == 'obj':
      self.buildobjexpress(parent, type_, name, value, isschema)
    else:
      self.buildbasexpress(parent, type_, name, value, isschema)
      
  def getrootname(self, exportmark, isitem):
    return exportmark + '' + (self.context.extension or '') if isitem else exportmark + (self.context.extension or '')

  def export(self):
    paths = re.split(r'[,;|]+', context.path.strip())

    for self.path in paths:
      if not self.path:
        continue
      
      self.checkpath(self.path)
      data = xlrd.open_workbook(self.path)
      cout = None
      for sheet in data.sheets():
        # # 检查是否为多语言表
        # if self._is_i18n_sheet(sheet):
        #   print('export i18n sheet:', sheet.name)
        #   self.export_i18n_sheet(sheet)
        #   continue
        # print(sheet.name)
        if sheet.name.endswith('$Enum'):
          #  print('export enum sheet:', sheet.name)
           self.export_enum_sheet(sheet)
           continue

        exportmark = getexportmark(sheet.name)
       
        self.sheetname = sheet.name
        if exportmark:
          coutmark = sheet.name.endswith('<<')
          configtitleinfo = self.getconfigsheetfinfo(sheet)
          if not configtitleinfo:
            root = self.getrootname(exportmark, not coutmark)
            item = exportmark
          else:
            root = self.getrootname(exportmark, False)
            item = None
          
          if not cout:
            exportfile = gerexportfilename(root, self.context.format, self.context.folder)
            self.checksheetname(self.path, sheet.name, root)
        
            exportobj = None
            nochanged = False
            #if isoutofdate(self.path, exportfile):
            if item:
              exportobj = self.exportitemsheet(sheet)
            else:
              exportobj = self.exportconfigsheet(sheet, configtitleinfo)
            # else:
            #   nochanged = True
            #   print(exportfile + ' is not change, so skip!')

            if coutmark:
              if not item:
                cout = exportobj
              else:
                cout = (collections.OrderedDict(), collections.OrderedDict())
                cout[0][item] = [[exportobj[0]]]
                item = None
                exportobj = cout
                obj = exportobj[1]
                print("export config sheet111:",exportobj)
                if obj:
                  cout[1][item] = obj
            # print("export config sheet:",exportobj)
            # print(root,'-----------', exportfile, exportmark,item)
            self.addrecord(self.path, sheet, exportfile, root, item, exportobj, exportmark)
            if coutmark and nochanged:
              break
          else:
            if item:
              exportobj = self.exportitemsheet(sheet)
              cout[0][item] = [[exportobj[0]]]
              obj = exportobj[1]
              if obj:
                cout[1][item] = obj
            else:
              exportobj = self.exportconfigsheet(sheet, configtitleinfo)
              cout[0].update(exportobj[0])   
              obj = exportobj[1]
              if obj:
                cout[1].update(obj)

    self.generate_combined_enum_file()                
    self.checkconstraint()
    self.saves()
    # 在导出完成后导出多语言数据
    self.export_i18n_data()

  def export_enum_sheet(self, sheet):
      """导出枚举表并生成TypeScript枚举类"""
      # 提取枚举类名
      enum_name ='e'+ sheet.name.split('|')[1].strip()[:-5]
      enum_exp = sheet.name.split('|')[0]
      
      # 获取列名行
      col_names = sheet.row_values(2)  # 第三行是列名行（0-indexed）
      
      # 确定列索引
      id_col = -1
      name_col = -1
      note_col = -1
      
      for idx, col_name in enumerate(col_names):
          col_name = col_name.strip().lower()
          if 'id' in col_name:
              id_col = idx
          elif 'name' in col_name:
              name_col = idx
          elif 'note' in col_name or 'desc' in col_name:
              note_col = idx
              
      if id_col == -1 or name_col == -1:
          print(f"Warning: Enum sheet {sheet.name} does not have required columns (id and name). Skipping.")
          return
          
      # 收集数据
      enum_data = []
      for row_idx in range(4, sheet.nrows):  # 从第四行开始是数据
          row = sheet.row_values(row_idx)
          if not row:  # 空行跳过
              continue
              
          # 获取id, name, note
          enum_id = row[id_col]
          enum_name_val = row[name_col].strip()
          enum_note = row[note_col].strip() if note_col != -1 and note_col < len(row) else ""
          
          # 确保id是整数
          try:
              enum_id = int(enum_id)
          except ValueError:
              print(f"Warning: Invalid enum id '{enum_id}' in row {row_idx+1}. Skipping.")
              continue
              
          enum_data.append((enum_id, enum_name_val, enum_note))
      
      # 生成TypeScript枚举类
      self.generate_typescript_enum(enum_name, enum_data, enum_exp)
  
  def generate_typescript_enum(self, enum_name, enum_data, enum_exp):
      """生成TypeScript枚举定义"""
      # 构建枚举代码
      enum_lines = [
          f"/**",
          f" * Auto-generated from Excel - Enum: {enum_name}",
          f" * {enum_exp}",
          f" */",
          f"export enum {enum_name} {{"
      ]
      
      for item in enum_data:
          enum_id, name, note = item
          # 确保枚举成员名称是合法的TS标识符
          member_name = re.sub(r'\W', '_', name)
          if re.match(r'^\d', member_name):
              member_name = '_' + member_name
              
          # 添加注释
          if note:
              enum_lines.append(f"    /** {note} */")
              
          enum_lines.append(f"    {member_name} = {enum_id},")
          
      enum_lines.append("}\n")  # 添加空行分隔
      
      # 添加到枚举定义列表
      self.enum_definitions.append("\n".join(enum_lines))

  def generate_combined_enum_file(self):
      """生成统一的枚举文件 EnumDef.ts"""
      if not self.enum_definitions:
          print("No enums found, skipping EnumDef.ts generation")
          return
          
      # 确定输出目录
      ts_dir = os.path.dirname(self.context.scriptPath) if hasattr(self.context, 'scriptPath') else self.context.folder
      if not ts_dir:
          ts_dir = self.context.folder
          
      os.makedirs(ts_dir, exist_ok=True)
      
      # 构建文件路径
      enum_file_path = os.path.join(ts_dir, 'EnumDef.ts')
      
      # 创建文件头部
      file_header = [
          "/**",
          " * Auto-generated Enum Definitions",
          " * This file contains all enums generated from Excel sheets",
          " */",
          ""
      ]
      
      # 写入文件
      with codecs.open(enum_file_path, 'w', 'utf-8') as f:
          f.write("\n".join(file_header))
          f.write("\n".join(self.enum_definitions))
          
      print(f'save combined enum file: {enum_file_path}')

  def _is_i18n_sheet(self, sheet):
    """检查是否为专门的多语言表"""
    # 首先检查工作表是否有足够的行
    if sheet.nrows < 3:
        return False  # 工作表行数不足3行，肯定不是多语言表
    
    try:
        titles = sheet.row_values(2)  # 获取第3行的值(索引为2)
        return 'key' in titles and any(lang in titles for lang in self.i18n_sheet_titles[1:])
    except IndexError as e:
        # 如果仍然出现索引错误(虽然理论上不应该，因为已经检查了nrows)
        print(f"Error accessing row values: {e}")
        return False
  
  # def export_i18n_sheet(self, sheet):
  #   """导出专门的多语言表"""
  #   titles = sheet.row_values(0)
  #   key_col = titles.index('key')
  #   lang_cols = {
  #       lang: titles.index(lang) 
  #       for lang in self.i18n_sheet_titles[1:] 
  #       if lang in titles
  #   }
    
  #   translations = {}
  #   print('++++++++++++++++')
  #   for row_idx in range(1, sheet.nrows):
  #       row = sheet.row_values(row_idx)
  #       key = str(row[key_col]).strip()
  #       if not key:
  #           continue
            
  #       for lang, col_idx in lang_cols.items():
  #           if lang not in translations:
  #               translations[lang] = {}
  #           translations[lang][key] = str(row[col_idx]).strip()
    
  #   # 合并到主多语言数据
  #   for lang, lang_translations in translations.items():
  #       if lang not in self.i18n_data['translations']:
  #           self.i18n_data['translations'][lang] = {}
  #       self.i18n_data['translations'][lang].update(lang_translations)

  def export_i18n_data(self):
    """导出完整的多语言数据"""
    print('export i18n data...')
    if not self.i18n_data['translations']:
        return
    
    # 导出键映射表
    keys_file = os.path.join(self.context.folderi18n, 'i18n_keys.json')
    with codecs.open(keys_file, 'w', 'utf-8') as f:
        json.dump(self.i18n_data['keys'], f, ensure_ascii=False, indent=2)
    print(f'save i18n keys: {keys_file}')
    
    # 为每种语言生成翻译文件
    for lang, translations in self.i18n_data['translations'].items():
        lang_file = os.path.join(self.context.folderi18n, f'i18n_{lang}.json')
        with codecs.open(lang_file, 'w', 'utf-8') as f:
            json.dump(translations, f, ensure_ascii=False, indent=2)
        print(f'save i18n translations: {lang_file}')
    
    # 生成合并的多语言数据文件
    combined_file = os.path.join(self.context.folderi18n, 'i18n_combined.json')
    with codecs.open(combined_file, 'w', 'utf-8') as f:
        json.dump(self.i18n_data, f, ensure_ascii=False, indent=2)
    print(f'save combined i18n data: {combined_file}')


  def process_i18n_field(self, field_name, value, row_data, type_):
    """处理多语言字段，保留原始文本和键"""
    if not field_name.endswith('_i18n'):
        print(f"Field {field_name} is not an i18n field, skipping...")
        return value
        
    # 提取基础字段名和语言
    base_field = field_name[:-5]
    lang = 'default'  # 默认语言

    # 检查是否有特定语言后缀 (如 name_zh-CN_i18n)
    for supported_lang in self.i18n_sheet_titles[1:]:
        # print(supported_lang, field_name)
        if field_name.endswith(f'_{supported_lang}_i18n'):
            base_field = field_name[:-len(f'_{supported_lang}_i18n')]
            lang = supported_lang
            break
    
    #生成唯一键 (表名_字段名_ID)
    tName = getexportmark(self.sheetname)
    # print(base_field, tName)
    key = f"{tName}_{base_field}_{row_data.get('id', '')}"
    
    #存储原始文本
    if key not in self.i18n_data['keys']:
        self.i18n_data['keys'][key] = {
            'field': base_field,
            'sheet': tName,
            'id': row_data.get('id', '')
        }
    
    typename = self.gettype(type_)
    if typename == 'list':
      list_ = []
      basetype = type_[:-2]  
      if value == '':
        list_ = []
      else:  
        valuelist = value.strip('[]').split(',')
        for v in valuelist:
            self.buildexpress(list_, basetype, field_name, v)
      value = list_
        
    # 存储翻译文本
    if lang not in self.i18n_data['translations']:
        self.i18n_data['translations'][lang] = {}
    self.i18n_data['translations'][lang][key] = value
    
    # 返回键用于数据文件
    return key        
    
  def getconfigsheetfinfo(self, sheet):
    titles = sheet.row_values(0)
    
    nameindex = getindex(titles, self.configsheettitles[0])
    valueindex = getindex(titles, self.configsheettitles[1])
    typeindex = getindex(titles, self.configsheettitles[2])
    signindex = getindex(titles, self.configsheettitles[3])
    descriptionindex = getindex(titles, self.configsheettitles[4])
    
    if nameindex != -1 and valueindex != -1 and typeindex != -1:
      return (nameindex, valueindex, typeindex, signindex, descriptionindex)
    else:
      return None

  def _check_duplicate_field_names(self, names, sheet_name):
    """检查第三行字段名是否有重复"""
    seen_names = {}
    duplicate_fields = []
    
    for col_index, name in enumerate(names):
        original_name = str(name).strip()
        if not original_name:  # 空字段名跳过
            continue
            
        # 规范化字段名（移除_i18n后缀进行比较）
        normalized_name = original_name[:-5] if original_name.endswith('_i18n') else original_name
        
        if normalized_name in seen_names:
            # 发现重复字段
            duplicate_fields.append({
                'field_name': normalized_name,
                'original_names': [original_name, seen_names[normalized_name]['original']],
                'columns': [col_index + 1, seen_names[normalized_name]['column']]
            })
        else:
            seen_names[normalized_name] = {
                'original': original_name,
                'column': col_index + 1
            }
    
    # 如果有重复字段，抛出详细错误信息
    if duplicate_fields:
        error_msg = f"工作表 '{sheet_name}' 第3行发现重复字段名：\n"
        for dup in duplicate_fields:
            error_msg += (f"  字段 '{dup['field_name']}' 重复出现在列 {dup['columns']} "
                         f"(原始名称: {dup['original_names']})\n")
        error_msg += "请修改字段名确保唯一性。"
        raise ValueError(error_msg)
        
  def exportitemsheet(self, sheet):
    descriptions = sheet.row_values(0)
    types = sheet.row_values(1)
    names = sheet.row_values(2)
    signs = sheet.row_values(3)
    
    self._check_duplicate_field_names(names, sheet.name)
    titleinfos = []
    schemaobj = collections.OrderedDict()
    # print('export itemsheet...',types )
    try:
      for colindex in range(sheet.ncols):
        type_ = str(types[colindex]).strip()
        name = str(names[colindex]).strip()
        signmatch = issignmatch(self.context.sign, str(signs[colindex]).strip())
        # print('exportitemsheet', type_, name, signmatch)
        titleinfos.append((type_, name, signmatch))

        if self.context.codegenerator:
          if type_ and name and signmatch:
            self.buildexpress(schemaobj, type_, name, descriptions[colindex], True)
        # print('exportitemsheet end', type_, schemaobj)
                    
    except Exception as e: 
      e.args += ('%s has a title error, %s at %d column in %s' % (sheet.name, (type_, name), colindex + 1, self.path) , '')
      raise e
      
    list_ = []
    hasexport = next((i for i in titleinfos if i[0] and i[1] and i[2]), False)
    if hasexport:
      try:
        spacerowcount = 0
        for self.rowindex in range(4, sheet.nrows):
          row = sheet.row_values(self.rowindex)
          item = collections.OrderedDict()
          
          firsttext = str(row[0]).strip()
          if not firsttext:
            spacerowcount += 1
            if spacerowcount >= self.spacemaxrowcount:      # if space row is than max count, skil follow rows     
              break
          
          if not firsttext or firsttext[0] == '#':    # current line skip
            continue
             
          skiptokenindex = None   
          if firsttext[0] == '!':
            nextpos = firsttext.find('!', 1)
            if nextpos >= 2:
              signtoken = firsttext[1: nextpos]
              if issignmatch(self.context.sign, signtoken.strip()):
                continue
              else:
                skiptokenindex = len(signtoken) + 2
                 
          for self.colindex in range(sheet.ncols):
            signmatch = titleinfos[self.colindex][2]
            type_ = titleinfos[self.colindex][0]
            name = titleinfos[self.colindex][1]
            value = str(row[self.colindex])
            if skiptokenindex and self.colindex == 0:
              value = value.lstrip()[skiptokenindex:]
            # # 处理多语言字段
            if name.endswith('_i18n'):
              #print(type_, name, value, '\n')
              value = self.process_i18n_field(name, value, item, type_)
            if signmatch:
              #if type_ and name and value:
              if type_ and name:
                self.buildexpress(item, type_, name, value)  
            spacerowcount = 0
                
          if item:
            list_.append(item)
      except Exception as e:        
          e.args += ('%s has a error in %d row %d column in %s' % (sheet.name, self.rowindex + 1, self.colindex + 1, self.path) , '')
          raise e
    # print('export itemsheet end...',schemaobj )
    return (schemaobj, list_)
    
        
  def exportconfigsheet(self, sheet, titleindexs):
    nameindex = titleindexs[0]
    valueindex = titleindexs[1]
    typeindex = titleindexs[2]
    signindex = titleindexs[3]
    descriptionindex = titleindexs[4]
    
    schemaobj = collections.OrderedDict()
    obj = collections.OrderedDict()
    
    try:
      spacerowcount = 0
      
      for self.rowindex in range(1, sheet.nrows):
        row = sheet.row_values(self.rowindex) 
    
        name = str(row[nameindex]).strip()
        value = str(row[valueindex])
        type_ = str(row[typeindex]).strip()
        description = str(row[descriptionindex]).strip()
        
        if signindex > 0:
          sign = str(row[signindex]).strip()
          if not issignmatch(self.context.sign, sign):
            continue
          
        if not name and not value and not type_:
          spacerowcount += 1
          if spacerowcount >= self.spacemaxrowcount:
            break            # if space row is than max count, skil follow rows     
          continue
            
        if name and type_:
          if(name[0] != '#'):         # current line skip
            if self.context.codegenerator:
              self.buildexpress(schemaobj, type_, name, description, True)
            if value:    
              self.buildexpress(obj, type_, name, value)
          spacerowcount = 0    
              
    except Exception as e:
      e.args += ('%s has a error in %d row (%s, %s, %s) in %s' % (sheet.name, self.rowindex + 1, type_, name, value, self.path) , '')
      raise e
  
    return (schemaobj, obj)
  
  # ====================== 新增的代码开始 ======================

  def _encode_data(self, data):
    """简单示例编码"""
    import base64
    import zlib
    json_str = json.dumps(data)
    compressed = zlib.compress(json_str.encode('utf-8'))
    return base64.b64encode(compressed).decode('utf-8')

  def _build_indexes(self, data_obj):
    """构建字段索引"""
    data_obj["index"] = {}
    
    # 为每个字段创建索引
    for col_idx, field_name in enumerate(data_obj["nameList"]):
        if field_name == "id":  # 跳过主键
            continue
            
        index = {}
        for row_idx, row in enumerate(data_obj["data"]):
            value = row[col_idx]
            if value not in index:
                index[value] = []
            index[value].append(row_idx)
        
        data_obj["index"][field_name] = index

  def export_compact_json(self, record):
    """导出紧凑型JSON格式"""
    if not record.obj:
        return
        
    # 转换数据为二维数组格式
    data_array = []
    key_map = {}
    
    # 获取字段名和类型列表
    name_list = []
    type_list = []
    
    if isinstance(record.obj, list):
        # 处理数据表
        for idx, item in enumerate(record.obj):
            row = []
            for i, (name, value) in enumerate(item.items()):
                if idx == 0:  # 第一行提取字段信息
                  if name.endswith('_i18n'):
                    name = name[:-5]
                  if name not in name_list:
                    name_list.append(name)
                    type_list.append(self._get_compact_type(value))
                  else:
                    #抛出异常
                    raise ValueError(f"字段名 '{name}' 已存在，不允许重复")

                row.append(value)
                # 建立键映射 (假设第一个字段是ID)
                if i == 0:
                    key_map[str(value)] = idx
                    
            data_array.append(row)
    else:
        # 处理配置表
        for i, (name, value) in enumerate(record.obj.items()):
            name_list.append(name)
            type_list.append(self._get_compact_type(value))
            data_array.append([value])
    
    # 构建输出结构
    output = {
        "isEncode": False,
        "data": {
            "data": data_array,
            "key": key_map,
            "type": 0,  # 0表示普通表，1表示配置表
            "nameList": name_list,
            "typeList": type_list,
            "dbList": [],  # 数据库相关列表，默认为空
            "name": record.root,  # 使用root作为表名
            "index": {}  # 可添加额外索引
        }
    }
    # 生成索引
    if self.context.create_index:
      self._build_indexes(output["data"])

    # 添加编码支持
    if self.context.encode:
      output["isEncode"] = True
      output["data"]["data"] = self._encode_data(output["data"]["data"])

    # 添加多语言文本到输出
    # if hasattr(self, 'i18n_data') and self.i18n_data['translations']:
    #   output['i18n'] = {
    #       'keys': self.i18n_data['keys'],
    #       'default_lang': self.i18n_sheet_titles[1]  # 第一个支持的语言作为默认语言
    #   }
    
    # 写入文件
    with codecs.open(record.exportfile, 'w', 'utf-8') as f:
        json.dump(output, f, ensure_ascii=False,  separators=(',', ':'))
    print(f'save compact json: {record.exportfile}')

  def _get_compact_type(self, value):
    """获取紧凑类型标识"""
    if isinstance(value, int):
        return "i"
    elif isinstance(value, float):
        return "f"
    elif isinstance(value, str):
        return "s"
    elif isinstance(value, bool):
        return "b"
    else:
        return "o"  # other
  
  # ====================== 新增的代码结束 ======================
  def _convert_type_to_ts(self, type_def, is_array_item=False):
    """转换类型定义为TypeScript类型"""
    if isinstance(type_def, str):
        # 处理基础类型和数组类型
        if type_def.endswith('[][]'):
            element_type = self._convert_type_to_ts(type_def[:-4], True)
            return f"{element_type}[][]" if not is_array_item else f"{element_type}[]"
        elif type_def.endswith('[]'):
            element_type = self._convert_type_to_ts(type_def[:-2], True)
            return f"{element_type}[]" if not is_array_item else element_type
        elif type_def.startswith('list:'):
            element_type = self._convert_type_to_ts(type_def[5:], True)
            return f"{element_type}[]" if not is_array_item else element_type
        
        # 基础类型映射
        type_map = {
            'int': 'number',
            'double': 'number',
            'float': 'number',
            'string': 'string',
            'bool': 'boolean',
            'boolean': 'boolean',
            'obj': 'object',
            'object': 'object'
        }
        return type_map.get(type_def.lower(), 'any')
    
    elif isinstance(type_def, list):
        # 处理带描述的类型定义 [type, description]
        if len(type_def) >= 2 and isinstance(type_def[1], str):
            return self._convert_type_to_ts(type_def[0], is_array_item)
        
        # 处理嵌套类型定义
        element_type = self._convert_type_to_ts(type_def[0], True)
        return f"{element_type}[]" if not is_array_item else element_type
    return 'any'

  def _convert_object_schema_to_ts(self, schema):
    """转换对象schema为TypeScript接口"""
    if isinstance(schema, dict):
        fields = []
        for field, field_schema in schema.items():
            field_type = self._convert_type_to_ts(field_schema)
            description = self._get_field_description(field_schema)
            fields.append(f"\t/** {description} **/\n\t{field}: {field_type};")
        return "{\n" + "\n".join(fields) + "\n}"
    return "{}"
    
  def _convert_schema_to_ts(self, schema, is_array_item=False):
    """转换schema为TypeScript类型 (入口方法)"""
    if isinstance(schema, dict):
        # 处理对象类型
        return self._convert_object_schema_to_ts(schema)
    else:
        # 处理类型定义
        return self._convert_type_to_ts(schema, is_array_item)
    # """递归转换schema为TypeScript类型"""
    # # if isinstance(schema[0], list):
    # if isinstance(schema, dict):
    #     # 处理带类型描述的定义 {'type':..., 'description':...}
    #     if 'type' in schema:
    #         return self._convert_basic_type_to_ts(schema['type'], is_array_item)
    #     # 处理真正的对象类型
    #     return self._convert_object_schema_to_ts(schema)
    # elif isinstance(schema, list):
    #     if not schema:
    #         return "any[]" if not is_array_item else "any"
        
    #     # 处理带描述的类型定义 [type, description]
    #     # print(f"base_type.startswith(':'): {schema[0]}")
    #     if len(schema) >= 2 and isinstance(schema[1], str):
    #         base_type = schema[0]
    #         # 如果是数组类型，直接返回数组类型
    #         print(f"base_type.startswith(':'): {schema[0]}",isinstance(base_type, str) and base_type.endswith('[]'))
    #         if isinstance(base_type, str) and base_type.endswith('[]'):
    #             element_type = self._convert_basic_type_to_ts(base_type[:-2], True)
    #             return f"{element_type}[]" if not is_array_item else element_type
    #         return self._convert_basic_type_to_ts(base_type, is_array_item)
    #     base_type = schema[0]
        
    #     if isinstance(base_type, str):
            
    #         # 处理二维数组结构
    #         if base_type.endswith('[][]'):
    #             # 获取内部元素的类型
    #             element_type = self._convert_basic_type_to_ts(schema[0][:-4], True)
    #             return f"{element_type}[][]" if not is_array_item else f"{element_type}[]"
    #         if base_type.endswith('[]'):    
    #             # 处理一维数组
    #             element_type = self._convert_basic_type_to_ts(schema[0][:-2], True)
    #             return f"{element_type}[]" if not is_array_item else element_type
    #         if  base_type.startswith('list:'):
    #             # 处理列表类型
    #             element_type = self._convert_basic_type_to_ts(schema[0][5:], True)

    #             print(f"base_type.startswith('list:'): {element_type}")
    #             return f"{element_type}[]" if not is_array_item else element_type
    #     elif isinstance(base_type, list):
    #         # 处理对象类型
    #         return self._convert_schema_to_ts(base_type, is_array_item)
    #     return 'any'
    # else:
    #     # 处理基础类型
    #     return self._convert_basic_type_to_ts(schema[0], is_array_item)


  def _convert_basic_type_to_ts(self, type_str, is_array_item=False):
    """转换基础类型为TypeScript类型"""
    if isinstance(type_str, (dict, list)):
        return self._convert_schema_to_ts(type_str, is_array_item)
    
    # # 处理二维数组类型
    # if str(type_str).endswith('[][]'):
    #     base_type = str(type_str)[:-4]
    #     mapped_type = self._convert_basic_type_to_ts(base_type, True)
    #     return f"{mapped_type}[]" if is_array_item else f"{mapped_type}[][]"
    
    type_map = {
      'int': 'number',
      'double': 'number',
      'float': 'number',
      'string': 'string',
      'bool': 'boolean',
      'boolean': 'boolean',
      'obj': 'object',
      'object': 'object'
    }
    # 处理数组类型标记
    if isinstance(type_str, str):
        if type_str.endswith('[][]'):
            base_type = type_str[:-4]
            mapped_type = type_map.get(base_type.lower(), 'any')
            return f"Array<Array<{mapped_type}>>"
        elif type_str.endswith('[]'):
            base_type = type_str[:-2]
            mapped_type = type_map.get(base_type.lower(), 'any')
            return f"Array<{mapped_type}>"

    base_type = type_map.get(str(type_str).lower(), 'any')
    return base_type if is_array_item else base_type

  def _convert_object_schema_to_ts(self, schema):
    """转换对象类型为TypeScript接口"""
    fields = []
    for field, field_schema in schema.items():
        field_type = self._convert_schema_to_ts(field_schema, False)  # 对象字段本身不是数组元素
        fields.append(f"{field}: {field_type}")
    return "{" + "; ".join(fields) + "}"
  
  def generate_typescript_classes(self, schemas):
    """生成TypeScript类定义"""

    cNames = []
    keys = []
    # print('generate_typescript_classes', schemas)
    ts_classes = [
      "import { LocalizedEntity } from './LocalizedEntity';\n\n",
      "/** Auto-generated from Excel files **/\n\n"
      ]
    base_class = "LocalizedEntity"
   
    for schema in schemas:
      # print(schema)
      class_name = schema['item']  + 'Data' #self._get_class_name(schema['exportfile']) + 'Data'
      class_comment = f"/** {os.path.basename(schema['path'])} **/\n"
      class_name= class_name[0].upper() + class_name[1:]
      # 生成多语言键值对映射
      property_mappings = self._generate_property_mappings(schema)

      class_def = f"export class {class_name} extends {base_class} {{\n"
      class_def += f"\tconstructor() {{\n"
      class_def += f"\t\tsuper({json.dumps(property_mappings, indent=4)});\n"
      class_def += f"\t}}\n\n"
      fields = self._get_class_fields(schema)
      class_def += "\n".join(fields) + "\n}\n\n"
      
      ts_classes.append(class_comment + class_def)
      cNames.append(class_name)
      keys.append(schema['item'])
    return "".join(ts_classes), keys, cNames

  def _generate_property_mappings(self, schema):
    """生成属性名到多语言键的映射"""
    mappings = {}
    field_schema = schema['schema']
    
    if schema['item']:  # 列表类型数据
      if isinstance(field_schema, dict):
        for field in field_schema.keys():
          if field.endswith('_i18n'):
            mappings[field[:-5]] = f"{schema['item']}_{field[:-5]}"
    else:  # 配置类型数据
      for field in field_schema.keys():
        mappings[field] = f"{schema['root']}.{field}"
    
    return mappings

  def _get_class_name(self, filepath):
    """从文件名生成类名"""
    base_name = os.path.splitext(os.path.basename(filepath))[0]
    # 转换为PascalCase
    return "".join(x.capitalize() for x in re.split(r"[_\s-]+", base_name))

  def _get_class_fields(self, schema):
    """生成类的字段定义"""
    fields = []
    field_schema = schema['schema']
    if schema['item']:  # 列表类型数据
      if isinstance(field_schema, dict):
        for field, sub_schema in field_schema.items():
          fields.append(self._get_field_definition(field, sub_schema))
    else:  # 配置类型数据
      for field, sub_schema in field_schema.items():
        fields.append(self._get_field_definition(field, sub_schema))
    
    return fields
  

  def _get_field_definition(self, field_name, field_schema):
    """生成单个字段定义"""
    if field_name.endswith('_i18n'):
      field_name = field_name[:-5]  # 移除_i18n后缀
    field_type = self._convert_schema_to_ts(field_schema)
    description = self._get_field_description(field_schema)
    return f"\t/** {description} **/\n\t{field_name}: {field_type};"

  def _get_field_description(self, field_schema):
    """获取字段描述"""
    if isinstance(field_schema, list) and len(field_schema) > 1:
      # return field_schema[1] if isinstance(field_schema[1], str) else ""
      return normalize_comment(field_schema[1])
    return ""

  def read_template_file(self, template_file):
    """读取模板文件内容"""
    try:
        with open(template_file, 'r', encoding='utf-8') as f:
            return f.read()
    except IOError as e:
        print(f"读取模板文件失败: {e}")
        return None

  def write_config_mgr(self, keys, types, mgr_file):
    """
    生成 ConfigMgr.ts 文件

    :param keys: 键名列表，如 ["buff", "waveTimes", ...]
    :param types: 类型名列表，如 ["BuffData", "WaveTimesData", ...]
    :param mgr_file: 输出文件路径，如 "path/to/ConfigMgr.ts"
    """
    template_file = "./templates/ConfigMgr.txt"
    
    try:
        with open(template_file, "r", encoding="utf-8") as f:
            template_content = f.read()
    except Exception as e:
        return False

    # 2. 验证输入数据
    if not keys or not types:
        return False
    if len(keys) != len(types):
        return False

    # 3. 生成替换内容（添加调试输出）
    key_str = ",".join(f'"{key}"' for key in keys)
    type_str = ", ".join(types)
    

    # 4. 执行替换
    file_content = template_content
    file_content = file_content.replace("${keys}", key_str)
    file_content = file_content.replace("${types}", type_str)

   
    try:
        os.makedirs(os.path.dirname(mgr_file), exist_ok=True)
        with open(mgr_file, "w", encoding="utf-8") as f:
            f.write(file_content)
        return True
    except Exception as e:
        return False
    
  def saves(self):
    schemas = []

    keys = []
    types = []
    for r in self.records:
      if r.obj:
        self.save(r)
        
        if self.context.codegenerator:        # has code generator
          schemas.append({ 'exportfile' : r.exportfile, 'root' : r.root, 'item' : r.item or r.exportmark, 'schema' : r.schema, 'path':r.path })

    # 保存合并的.hrl文件
    if hasattr(self, '_erlang_record_defs') and self._erlang_record_defs:
        save_combined_hrl(self.records, self.context.folder)
    
    if schemas and self.context.codegenerator:
      # 生成原有的schema.json
      schemasjson = json.dumps(schemas, ensure_ascii=False, indent=2)
      dir = os.path.dirname(self.context.codegenerator)
      if dir and not os.path.isdir(dir):
          os.makedirs(dir)
      with codecs.open(self.context.codegenerator, 'w', 'utf-8') as f:
          f.write(schemasjson)
      
      # 生成TypeScript类定义文件
      if self.context.typescript:
        ts_classes, keys, types = self.generate_typescript_classes(schemas)

        dir = os.path.dirname(self.context.scriptPath)
        if dir and not os.path.isdir(dir):
            os.makedirs(dir)
        ts_file = os.path.join(os.path.dirname(self.context.codegenerator), self.context.scriptPath + "DataDef.ts")
        with codecs.open(ts_file, 'w', 'utf-8') as f:
            f.write(ts_classes)
        print(f'save TypeScript classes to {ts_file}')
        # 定义模板文件和输出文件路径
        mgr_file = self.context.scriptPath +"ConfigMgr.ts"       # 输出文件路径
        self.write_config_mgr(keys, types, mgr_file)
    
                
  def save(self, record):
    if not record.obj:
      return
  
    if not os.path.isdir(self.context.folder):
      os.makedirs(self.context.folder)
    
    if not os.path.isdir(self.context.folderi18n):
      os.makedirs(self.context.folderi18n)
    
        
    if self.context.format == 'json':
      jsonstr = json.dumps(record.obj, ensure_ascii = False, separators=(',', ':'))
      with codecs.open(record.exportfile, 'w', 'utf-8') as f:
        f.write(jsonstr)
      print('save %s from %s in %s' % (record.exportfile, record.sheet.name, record.path))
    elif self.context.format == 'compact_json':  # 新增格式
      self.export_compact_json(record) 
      #print('save %s from %s in %s' % (record.exportfile, record.sheet.name, record.path))
    elif self.context.format == 'xml':
      if record.item:
        record.obj = { record.item : record.obj }
      savexml(record)   
    elif self.context.format == 'lua':
      luastr = "".join(tolua(record.obj))
      with codecs.open(record.exportfile, 'w', 'utf-8') as f:
        f.write('return ')
        f.write(luastr)
      print('save %s from %s in %s' % (record.exportfile, record.sheet.name, record.path))  
    elif self.context.format == 'ycl':
      g = toycl(record.obj)
      next(g) # skip first newline
      yclstr = "".join(g)
      with codecs.open(record.exportfile, 'w', 'utf-8') as f:
        f.write(yclstr)
      print('save %s from %s in %s' % (record.exportfile, record.sheet.name, record.path))
    elif self.context.format == 'erlang':
      record_def = export_erlang(record)
      if record_def:
            # 保存记录定义以便最后合并
            if not hasattr(self, '_erlang_record_defs'):
                self._erlang_record_defs = []
            self._erlang_record_defs.append(record_def)

  def addrecord(self, path, sheet, exportfile, root, item, obj, exportmark):
    r = Record(path, sheet, exportfile, root, item, obj, exportmark, self.context)
    self.records.append(r)
      
  def checksheetname(self, path, sheetname, root):
    r = next((r for r in self.records if r.root == root), False)
    if r:
      raise ValueError('%s in %s is already defined in %s' % (root, path, r.path))
      
  def checkpath(self, path):
    r = next((r for r in self.records if r.path == path), False)
    if r:
      raise ValueError('%s is already export' % path)
            
  def addconstraint(self, mark, field, valueinfo):
    c = Constraint(mark, field)
    c.valueinfo = valueinfo
    c.path = self.path
    c.sheetname = self.sheetname
    c.rowindex = self.rowindex
    c.colindex = self.colindex
    self.constraints.append(c)

  def checkconstraint(self):
    for c in self.constraints:
      r = next((r for r in self.records if r.item == c.mark), False)
      if not r:
        raise ValueError('%s(mark) not found ,%s has a constraint %s error in %d row %d column in %s' % (c.mark, c.sheetname, c.valueinfo, c.rowindex + 1, c.colindex + 1, c.path))
      
      if not r.obj:  # is not change so not load
        exportobj = self.exportitemsheet(r.sheet)
        r.setobj(exportobj)
      
      v = c.valueinfo[2]    
      i = next((i for i in r.obj if i[c.field] == v), False)    
      if not i:
        raise ValueError('%s(field) %s not found ,%s has a constraint %s error in %d row %d column in %s' % (c.field, v, c.sheetname, c.valueinfo, c.rowindex + 1, c.colindex + 1, c.path))
    
if __name__ == '__main__':
  class Context:
    '''usage python proton.py [-p filelist] [-f outfolder] [-e format]
    Arguments
    -p      : input excel files, use , or ; or space to separate
    -f      : out folder
    -e      : format, json/xml/lua/ycl/compact_json/erlang
  

    Options
    -s      ：sign, controls whether the column is exported, defalut all export
    -t      : suffix, export file suffix
    -c      : a file path, save the excel structure to json
              the external program uses this file to automatically generate the read code
    -l      :i18n folder
    -g      :language key ['zh', 'en', 'ja']
    -h      : print this help message and exit
    -r    : script path

    Example
    python proton.py -p ./data.xlsx -f ./data -e json -s a,b,c -t .json -c ./data.json -l ./i18n -g zh,en,ja -scr ./tools
    
    https://github.com/yanghuan/proton'''
  
  print('argv:' , sys.argv)
  opst, args = getopt.getopt(sys.argv[1:], 'p:f:e:s:t:c:h:l:g:r:')

  context = Context()
  context.path = None
  context.folder = '.'
  context.folderi18n = './i18n/'
  context.i18n_sheet_titles = ['key']
  context.format = 'json'
  context.sign = None
  context.extension = None
  context.codegenerator = None
  # context.i18n_enabled = False
  context.create_index = False #生成索引
  context.encode = False #编码支持
  context.typescript = True #生成ts
  context.scriptPath = './' #脚本路径

  for op,v in opst:
    # print( op,v,"------------")
    if op == '-p':
      context.path = v
    elif op == '-f':
      context.folder = v
    elif op == '-e':
      context.format = v.lower() 
    elif op == '-s':
      context.sign = v 
    elif op == '-t':
      context.extension = v
    elif op == '-c':
      context.codegenerator = v
    elif op =='-l':
      context.folderi18n = v
    elif op == '-r':
      context.scriptPath = v
    elif op == '-g':
      my_list = [item.strip() for item in v.split(',') if item.strip()] 
      context.i18n_sheet_titles.extend(my_list)  
    elif op == '-h':
      print(Context.__doc__)
      sys.exit()
      
  if not context.path:
    print(Context.__doc__)
    sys.exit(2)
    
  exportexcel(context)