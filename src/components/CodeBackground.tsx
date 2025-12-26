import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const CodeBackground: React.FC = () => {
  const backgroundRef = useRef<SVGSVGElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const animationIdRef = useRef<number | null>(null);
  const particlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; size: number; char: string; opacity: number; hue: number }>>([]);
  const lastTimeRef = useRef<number>(0);

  // 添加鼠标移动事件监听
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (!backgroundRef.current) return;

    const svg = d3.select(backgroundRef.current);
    const width = window.innerWidth;
    const height = window.innerHeight;

    // 清除现有内容
    svg.selectAll('*').remove();

    // 设置SVG尺寸
    svg.attr('width', width)
       .attr('height', height)
       .style('background', 'radial-gradient(ellipse at center, #0a1929 0%, #020c1b 70%, #000511 100%)');

    // 创建代码字符集
    const codeChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789{}[]();,:.<>/?`~!@#$%^&*|';
    const keywords = ['function', 'const', 'let', 'if', 'else', 'for', 'while', 'return', 'import', 'export', 'class', 'async', 'await'];

    // 添加拖尾层和连线层
    const trails = svg.append('g').attr('class', 'trails');
    const connections = svg.append('g').attr('class', 'connections');

    // 1. 创建浮动关键字（减少数量，增加间距）
    const keywordCount = 8;
    const floatingKeywords: Array<{ x: number; y: number; vx: number; vy: number; text: string; hue: number; size: number }> = [];
    
    for (let i = 0; i < keywordCount; i++) {
      floatingKeywords.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        text: keywords[Math.floor(Math.random() * keywords.length)],
        hue: Math.random() * 30 + 180,
        size: Math.random() * 4 + 14
      });
    }

    // 2. 创建二进制雨（优化性能）
    const binaryRainCount = 20;
    const binaryRain: Array<{ x: number; y: number; speed: number; char: string }> = [];
    
    for (let i = 0; i < binaryRainCount; i++) {
      binaryRain.push({
        x: Math.random() * width,
        y: Math.random() * -height,
        speed: Math.random() * 12 + 8,
        char: Math.random() > 0.5 ? '1' : '0'
      });
    }

    // 3. 创建代码雨（优化性能）
    const rainCount = 80;
    const codeRain: Array<{ x: number; y: number; speed: number; char: string; hue: number }> = [];
    
    for (let i = 0; i < rainCount; i++) {
      codeRain.push({
        x: Math.random() * width,
        y: Math.random() * -height * 2,
        speed: Math.random() * 3 + 2,
        char: codeChars[Math.floor(Math.random() * codeChars.length)],
        hue: Math.random() * 30 + 180
      });
    }

    // 4. 创建主粒子（使用引用优化性能）
    const particleCount = 150;
    particlesRef.current = [];
    
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 6 + 8,
        char: codeChars[Math.floor(Math.random() * codeChars.length)],
        opacity: Math.random() * 0.4 + 0.3,
        hue: Math.random() * 30 + 180
      });
    }

    // 创建所有SVG元素
    const floatingGroup = svg.append('g').attr('class', 'floating-keywords');
    const binaryGroup = svg.append('g').attr('class', 'binary-rain');
    const codeRainGroup = svg.append('g').attr('class', 'code-rain');
    const particleGroup = svg.append('g').attr('class', 'main-particles');

    // 初始化渲染
    const render = () => {
      // 渲染浮动关键字
      floatingGroup.selectAll('text')
        .data(floatingKeywords)
        .join('text')
        .text(d => d.text)
        .attr('x', d => d.x)
        .attr('y', d => d.y)
        .attr('fill', d => `hsla(${d.hue}, 80%, 65%, 0.6)`)
        .attr('font-size', d => d.size)
        .attr('font-weight', 'bold')
        .attr('pointer-events', 'none');

      // 渲染二进制雨
      binaryGroup.selectAll('text')
        .data(binaryRain)
        .join('text')
        .text(d => d.char)
        .attr('x', d => d.x)
        .attr('y', d => d.y)
        .attr('fill', (d, i) => `hsla(140, 100%, 60%, ${0.4 + Math.sin(Date.now() * 0.001 + i) * 0.2})`)
        .attr('font-size', '10')
        .attr('font-family', 'monospace')
        .attr('pointer-events', 'none');

      // 渲染代码雨
      codeRainGroup.selectAll('text')
        .data(codeRain)
        .join('text')
        .text(d => d.char)
        .attr('x', d => d.x)
        .attr('y', d => d.y)
        .attr('fill', d => `hsla(${d.hue}, 80%, 70%, 0.7)`)
        .attr('font-size', '13')
        .attr('font-family', 'monospace')
        .attr('font-weight', '500')
        .attr('pointer-events', 'none');

      // 渲染主粒子
      particleGroup.selectAll('text')
        .data(particlesRef.current)
        .join('text')
        .text(d => d.char)
        .attr('x', d => d.x)
        .attr('y', d => d.y)
        .attr('fill', d => `hsla(${d.hue}, 80%, 65%, ${d.opacity})`)
        .attr('font-size', d => d.size)
        .attr('font-family', 'monospace')
        .attr('pointer-events', 'none')
        .attr('filter', 'drop-shadow(0 0 1px rgba(100, 150, 255, 0.3))');
    };

    // 初始渲染
    render();

    // 动画函数（使用时间增量确保流畅度）
    const animate = (currentTime: number) => {
      const deltaTime = lastTimeRef.current ? (currentTime - lastTimeRef.current) / 16.67 : 1;
      lastTimeRef.current = currentTime;

      // 更新拖尾效果（简化版本）
      trails.selectAll('text').remove();
      
      particlesRef.current.forEach((p, i) => {
        if (i % 3 === 0) { // 每隔3个粒子创建一个拖尾，减少数量
          trails.append('text')
            .text(p.char)
            .attr('x', p.x - p.vx * 2)
            .attr('y', p.y - p.vy * 2)
            .attr('fill', `hsla(${p.hue}, 70%, 60%, 0.2)`)
            .attr('font-size', p.size * 0.8)
            .attr('font-family', 'monospace')
            .attr('pointer-events', 'none');
        }
      });

      // 更新浮动关键字
      floatingKeywords.forEach(kw => {
        kw.x += kw.vx * deltaTime;
        kw.y += kw.vy * deltaTime;
        
        // 边界反弹
        if (kw.x < 0 || kw.x > width) kw.vx *= -1;
        if (kw.y < 0 || kw.y > height) kw.vy *= -1;
        
        // 保持边界内
        kw.x = Math.max(0, Math.min(width, kw.x));
        kw.y = Math.max(0, Math.min(height, kw.y));
      });

      // 更新二进制雨
      binaryRain.forEach(br => {
        br.y += br.speed * deltaTime;
        if (br.y > height) {
          br.y = -20;
          br.x = Math.random() * width;
        }
        if (Math.random() > 0.95) {
          br.char = Math.random() > 0.5 ? '1' : '0';
        }
      });

      // 更新代码雨
      codeRain.forEach(cr => {
        cr.y += cr.speed * deltaTime;
        if (cr.y > height) {
          cr.y = -Math.random() * height;
          cr.x = Math.random() * width;
        }
        if (Math.random() > 0.9) {
          cr.char = codeChars[Math.floor(Math.random() * codeChars.length)];
        }
      });

      // 更新主粒子
      const mouseInfluenceRadius = 150;
      const mouseStrength = 0.5;
      
      particlesRef.current.forEach(p => {
        // 基础运动
        p.x += p.vx * deltaTime;
        p.y += p.vy * deltaTime;
        
        // 鼠标影响
        const dx = mousePos.current.x - p.x;
        const dy = mousePos.current.y - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouseInfluenceRadius) {
          const force = (mouseInfluenceRadius - distance) / mouseInfluenceRadius;
          p.vx += (dx / distance) * force * mouseStrength * deltaTime;
          p.vy += (dy / distance) * force * mouseStrength * deltaTime;
        }
        
        // 边界处理
        if (p.x < 0 || p.x > width) p.vx *= -0.9;
        if (p.y < 0 || p.y > height) p.vy *= -0.9;
        
        p.x = Math.max(0, Math.min(width, p.x));
        p.y = Math.max(0, Math.min(height, p.y));
        
        // 阻力
        p.vx *= 0.995;
        p.vy *= 0.995;
        
        // 随机字符变化
        if (Math.random() > 0.98) {
          p.char = codeChars[Math.floor(Math.random() * codeChars.length)];
        }
        
        // 轻微的颜色脉动
        p.opacity = 0.3 + Math.sin(currentTime * 0.002 + p.x * 0.01) * 0.2;
      });

      // 更新连线（优化性能，只连接较近的粒子）
      connections.selectAll('line').remove();
      
      const connectionPulse = Math.sin(currentTime * 0.003) * 0.3 + 0.7;
      const maxConnections = 30; // 限制连线数量
      let connectionsCount = 0;
      
      for (let i = 0; i < particlesRef.current.length && connectionsCount < maxConnections; i++) {
        for (let j = i + 1; j < particlesRef.current.length && connectionsCount < maxConnections; j++) {
          const p1 = particlesRef.current[i];
          const p2 = particlesRef.current[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 80 && distance > 10) {
            connectionsCount++;
            const opacity = (0.5 - distance / 160) * connectionPulse;
            
            connections.append('line')
              .attr('x1', p1.x)
              .attr('y1', p1.y)
              .attr('x2', p2.x)
              .attr('y2', p2.y)
              .attr('stroke', `hsla(200, 70%, 65%, ${opacity})`)
              .attr('stroke-width', 0.5)
              .attr('pointer-events', 'none');
          }
        }
      }

      // 重新渲染
      render();
      
      animationIdRef.current = requestAnimationFrame(animate);
    };

    // 开始动画
    lastTimeRef.current = performance.now();
    animationIdRef.current = requestAnimationFrame(animate);

    // 窗口大小调整处理
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      
      svg.attr('width', newWidth)
         .attr('height', newHeight);
      
      // 调整粒子位置，避免全部聚集在角落
      particlesRef.current.forEach(p => {
        if (p.x > newWidth) p.x = Math.random() * newWidth;
        if (p.y > newHeight) p.y = Math.random() * newHeight;
      });
    };

    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  return (
    <svg 
      ref={backgroundRef} 
      className="code-background"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        overflow: 'hidden'
      }}
    />
  );
};

export default CodeBackground;