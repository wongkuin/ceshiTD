#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CocosCreator专用压缩工具
"""

import os
import sys
import tkinter as tk
from tkinter import ttk, filedialog, messagebox, scrolledtext
import threading
import queue
from compress_png import PNGCompressor

class CocosCompressGUI:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("CocosCreator PNG压缩工具 v1.0")
        self.root.geometry("800x600")
        
        # 设置图标（可选）
        # self.root.iconbitmap('icon.ico')
        
        self.setup_ui()
        self.log_queue = queue.Queue()
        self.compression_thread = None
        
    def setup_ui(self):
        """设置用户界面"""
        # 顶部框架
        top_frame = ttk.Frame(self.root, padding="10")
        top_frame.grid(row=0, column=0, sticky=(tk.W, tk.E))
        
        # 标题
        title_label = ttk.Label(
            top_frame, 
            text="🎮 CocosCreator PNG图片压缩工具",
            font=("Arial", 16, "bold")
        )
        title_label.grid(row=0, column=0, columnspan=3, pady=(0, 10))
        
        # 目录选择
        ttk.Label(top_frame, text="项目目录:").grid(row=1, column=0, sticky=tk.W)
        self.dir_var = tk.StringVar(value=os.getcwd())
        dir_entry = ttk.Entry(top_frame, textvariable=self.dir_var, width=50)
        dir_entry.grid(row=1, column=1, padx=5)
        ttk.Button(
            top_frame, 
            text="浏览...", 
            command=self.select_directory
        ).grid(row=1, column=2)
        
        # 压缩设置框架
        settings_frame = ttk.LabelFrame(self.root, text="压缩设置", padding="10")
        settings_frame.grid(row=1, column=0, padx=10, pady=10, sticky=(tk.W, tk.E))
        
        # 质量设置
        ttk.Label(settings_frame, text="质量范围:").grid(row=0, column=0, sticky=tk.W)
        self.quality_var = tk.StringVar(value="65-80")
        quality_entry = ttk.Entry(settings_frame, textvariable=self.quality_var, width=15)
        quality_entry.grid(row=0, column=1, padx=5, pady=2)
        
        # 速度设置
        ttk.Label(settings_frame, text="压缩速度:").grid(row=1, column=0, sticky=tk.W)
        self.speed_var = tk.IntVar(value=3)
        speed_scale = ttk.Scale(
            settings_frame, 
            from_=1, 
            to=11, 
            variable=self.speed_var,
            orient=tk.HORIZONTAL,
            length=150
        )
        speed_scale.grid(row=1, column=1, padx=5, pady=2)
        ttk.Label(settings_frame, textvariable=self.speed_var).grid(row=1, column=2)
        
        # 跳过选项
        self.skip_var = tk.BooleanVar(value=True)
        ttk.Checkbutton(
            settings_frame,
            text="跳过压缩后变大的文件",
            variable=self.skip_var
        ).grid(row=2, column=0, columnspan=2, pady=5, sticky=tk.W)
        
        # 日志区域
        log_frame = ttk.LabelFrame(self.root, text="压缩日志", padding="10")
        log_frame.grid(row=2, column=0, padx=10, pady=10, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        self.log_text = scrolledtext.ScrolledText(
            log_frame, 
            height=15,
            width=70,
            font=("Consolas", 10)
        )
        self.log_text.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # 控制按钮框架
        button_frame = ttk.Frame(self.root, padding="10")
        button_frame.grid(row=3, column=0, sticky=(tk.W, tk.E))
        
        self.start_button = ttk.Button(
            button_frame,
            text="开始压缩",
            command=self.start_compression,
            width=15
        )
        self.start_button.grid(row=0, column=0, padx=5)
        
        ttk.Button(
            button_frame,
            text="清空日志",
            command=self.clear_log,
            width=15
        ).grid(row=0, column=1, padx=5)
        
        ttk.Button(
            button_frame,
            text="导出日志",
            command=self.export_log,
            width=15
        ).grid(row=0, column=2, padx=5)
        
        ttk.Button(
            button_frame,
            text="退出",
            command=self.root.quit,
            width=15
        ).grid(row=0, column=3, padx=5)
        
        # 进度条
        self.progress_var = tk.DoubleVar()
        self.progress_bar = ttk.Progressbar(
            self.root, 
            variable=self.progress_var,
            maximum=100,
            mode='determinate'
        )
        self.progress_bar.grid(row=4, column=0, padx=10, pady=5, sticky=(tk.W, tk.E))
        
        # 状态标签
        self.status_var = tk.StringVar(value="就绪")
        status_label = ttk.Label(
            self.root,
            textvariable=self.status_var,
            relief=tk.SUNKEN
        )
        status_label.grid(row=5, column=0, padx=10, pady=(0, 10), sticky=(tk.W, tk.E))
        
        # 配置网格权重
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(2, weight=1)
        log_frame.columnconfigure(0, weight=1)
        log_frame.rowconfigure(0, weight=1)
        
        # 定期检查日志队列
        self.root.after(100, self.process_log_queue)
    
    def select_directory(self):
        """选择目录"""
        directory = filedialog.askdirectory(
            initialdir=self.dir_var.get(),
            title="选择CocosCreator项目目录"
        )
        if directory:
            self.dir_var.set(directory)
    
    def log_message(self, message):
        """添加日志消息"""
        self.log_queue.put(message)
    
    def process_log_queue(self):
        """处理日志队列"""
        try:
            while True:
                message = self.log_queue.get_nowait()
                self.log_text.insert(tk.END, message + "\n")
                self.log_text.see(tk.END)
                self.root.update_idletasks()
        except queue.Empty:
            pass
        finally:
            self.root.after(100, self.process_log_queue)
    
    def clear_log(self):
        """清空日志"""
        self.log_text.delete(1.0, tk.END)
    
    def export_log(self):
        """导出日志"""
        filename = filedialog.asksaveasfilename(
            defaultextension=".txt",
            filetypes=[("Text files", "*.txt"), ("All files", "*.*")]
        )
        if filename:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(self.log_text.get(1.0, tk.END))
            messagebox.showinfo("成功", f"日志已导出到: {filename}")
    
    def compression_worker(self):
        """压缩工作线程"""
        try:
            config = {
                'quality': self.quality_var.get(),
                'speed': self.speed_var.get(),
                'skip_if_larger': self.skip_var.get()
            }
            
            compressor = PNGCompressor(config)
            
            # 重定向日志
            import sys
            import io
            
            class LogRedirector(io.StringIO):
                def write(self, text):
                    if text.strip():
                        self.log_message(text.strip())
                    return super().write(text)
            
            # 运行压缩
            target_dir = self.dir_var.get()
            success = compressor.run(target_dir)
            
            # 更新状态
            if success:
                self.status_var.set("压缩完成!")
                self.log_message("\n✅ 压缩任务完成!")
            else:
                self.status_var.set("压缩完成(有错误)!")
                self.log_message("\n⚠️  压缩完成，但有文件处理失败")
                
        except Exception as e:
            self.log_message(f"❌ 错误: {str(e)}")
            self.status_var.set("压缩失败!")
        finally:
            self.start_button.config(state=tk.NORMAL)
            self.progress_var.set(100)
    
    def start_compression(self):
        """开始压缩"""
        if not os.path.exists(self.dir_var.get()):
            messagebox.showerror("错误", "指定的目录不存在!")
            return
        
        # 禁用开始按钮
        self.start_button.config(state=tk.DISABLED)
        self.progress_var.set(0)
        self.status_var.set("压缩中...")
        self.clear_log()
        
        # 在后台线程中运行压缩
        self.compression_thread = threading.Thread(target=self.compression_worker)
        self.compression_thread.daemon = True
        self.compression_thread.start()
    
    def run(self):
        """运行GUI"""
        self.root.mainloop()

def main():
    """主函数"""
    if len(sys.argv) > 1 and sys.argv[1] == 'gui':
        app = CocosCompressGUI()
        app.run()
    else:
        # 命令行模式
        from compress_png import main as cli_main
        cli_main()

if __name__ == '__main__':
    main()