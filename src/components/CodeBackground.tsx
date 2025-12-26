import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const CodeBackground: React.FC = () => {
  const backgroundRef = useRef<SVGSVGElement>(null);
  const mousePos = useRef({ x: 0, y: 0 }); // 添加鼠标位置ref

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

    // 设置SVG尺寸
    svg.attr('width', width)
       .attr('height', height);

    // 创建代码字符集
    const codeChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789{}[]();,:.<>/?`~!@#$%^&*|';
    const keywords = ['function', 'const', 'let', 'if', 'else', 'for', 'while', 'return', 'import', 'export', 'class', 'async', 'await'];

    // 创建粒子群 - 浮动关键字
    const keywordCount = 15;
    const floatingKeywords = svg.selectAll('.floating-keyword')
      .data(d3.range(keywordCount))
      .enter()
      .append('text')
      .attr('class', 'floating-keyword')
      .text(_ => keywords[Math.floor(Math.random() * keywords.length)])
      .attr('x', _ => Math.random() * width)
      .attr('y', _ => Math.random() * height)
      .attr('fill', () => `hsla(${Math.random() * 30 + 180}, 70%, 60%, ${Math.random() * 0.6 + 0.2})`)
      .attr('font-size', _ => Math.random() * 16 + 12)
      .attr('font-weight', 'bold')
      .attr('pointer-events', 'none');

    // 创建粒子群 - 主粒子系统
    const particleCount = 300;
    const particles = svg.selectAll('text:not(.code-rain):not(.floating-keyword)')
      .data(d3.range(particleCount))
      .enter()
      .append('text')
      .text(_ => codeChars[Math.floor(Math.random() * codeChars.length)])
      .attr('x', _ => Math.random() * width)
      .attr('y', _ => Math.random() * height)
      .attr('fill', () => {
        const hue = Math.random() * 30 + 180 + Math.sin(Date.now() * 0.001) * 10; // 颜色渐变动画
        const lightness = Math.random() * 20 + 40;
        return `hsla(${hue}, 70%, ${lightness}%, ${Math.random() * 0.5 + 0.3})`;
      })
      .attr('font-size', _ => Math.random() * 12 + 8)
      .attr('pointer-events', 'none')
      .attr('filter', 'drop-shadow(0 0 2px rgba(100, 150, 255, 0.5))'); // 添加发光效果

    // 创建粒子群 - 二进制雨效果
    const binaryRainCount = 30;
    const binaryRain = svg.selectAll('.binary-rain')
      .data(d3.range(binaryRainCount))
      .enter()
      .append('text')
      .attr('class', 'binary-rain')
      .text(_ => Math.random() > 0.5 ? '1' : '0')
      .attr('x', _ => Math.random() * width)
      .attr('y', _ => -Math.random() * height)
      .attr('fill', () => `hsla(${Math.random() * 40 + 140}, 100%, 60%, ${Math.random() * 0.5 + 0.3})`)
      .attr('font-size', _ => Math.random() * 8 + 8)
      .attr('pointer-events', 'none');

    // 添加粒子拖尾层
    const trails = svg.append('g').attr('class', 'trails');

    // 添加连线层
    const connections = svg.append('g').attr('class', 'connections');

    // 创建粒子群 - 代码雨效果 (移至此处确保渲染在最上层)
    const rainCount = 80; // 增加粒子数量
    const codeRain = svg.selectAll('.code-rain')
      .data(d3.range(rainCount))
      .enter()
      .append('text')
      .attr('class', 'code-rain')
      .text(_ => codeChars[Math.floor(Math.random() * codeChars.length)])
      .attr('x', _ => Math.random() * width)
      .attr('y', _ => -Math.random() * height)
      .attr('fill', () => `hsla(${Math.random() * 30 + 180}, 80%, ${Math.random() * 20 + 70}%, ${Math.random() * 0.5 + 0.7})`) // 提高亮度和不透明度
      .attr('font-size', _ => Math.random() * 14 + 12) // 增大字体
      .attr('pointer-events', 'none');

    // 动画函数
    const animate = () => {
      // 保存粒子当前位置用于拖尾效果
      const currentPositions = particles.nodes().map(el => ({
        x: d3.select(el).attr('x'),
        y: d3.select(el).attr('y'),
        text: d3.select(el).text(),
        fill: d3.select(el).attr('fill'),
        fontSize: d3.select(el).attr('font-size')
      }));

      // 创建拖尾效果
      const trailElements = trails.selectAll<SVGTextElement, { x: string; y: string; text: string; fill: string; fontSize: string; }>('text')
        .data(currentPositions);

      trailElements.enter()
        .append('text')
        .merge(trailElements)
        .attr('x', d => d.x)
        .attr('y', d => d.y)
        .text(d => d.text)
        .attr('fill', d => d.fill.replace('hsla', 'hsla').replace(/([0-9.]+%)/g, m => parseFloat(m) * 0.3 + '%'))
        .attr('font-size', d => d.fontSize)
        .attr('opacity', function() {
          return parseFloat(d3.select(this).attr('opacity') || '0.5') - 0.1;
        })
        .attr('pointer-events', 'none');

      trailElements.exit().remove();

      // 粒子动画
      particles
        .attr('y', function() {
          const currentY = parseFloat(d3.select(this).attr('y') || '0');
          return currentY > height ? 0 : currentY + (Math.random() * 3 + 1);
        })
        .attr('x', function() {
          const currentX = parseFloat(d3.select(this).attr('x') || '0');
          // 鼠标吸引效果
          const dx = mousePos.current.x - currentX;
          const dy = mousePos.current.y - parseFloat(d3.select(this).attr('y') || '0');
          const distance = Math.sqrt(dx * dx + dy * dy);
          const attraction = distance < 200 ? (200 - distance) / 200 * 2 : 0;
          return currentX + (Math.random() * 3 - 1.5) + (dx / distance) * attraction;
        })
        .text(function() {
          return Math.random() > 0.95 ? codeChars[Math.floor(Math.random() * codeChars.length)] : d3.select(this).text();
        })
        .attr('font-size', function(d) {
          const baseSize = parseFloat(d3.select(this).attr('font-size') || '12');
          return baseSize + Math.sin(Date.now() * 0.005 + d) * 2;
        });

      // 代码雨动画
      codeRain
        .attr('y', function() {
          const currentY = parseFloat(d3.select(this).attr('y') || '0');
          return currentY > height ? -Math.random() * 100 : currentY + (Math.random() * 15 + 10); // 提高下落速度
        })
        .text(function() {
          return Math.random() > 0.85 ? codeChars[Math.floor(Math.random() * codeChars.length)] : d3.select(this).text(); // 更频繁更换字符
        });

      // 二进制雨动画
      binaryRain
        .attr('y', function() {
          const currentY = parseFloat(d3.select(this).attr('y') || '0');
          return currentY > height ? -Math.random() * 100 : currentY + (Math.random() * 15 + 10);
        })
        .text(function() {
          return Math.random() > 0.5 ? '1' : '0';
        })
        .attr('fill', '#00ff00')
        .attr('font-size', _ => Math.random() * 8 + 8)
        .attr('pointer-events', 'none');

      // 浮动关键字动画
      floatingKeywords
        .attr('y', function() {
          const currentY = parseFloat(d3.select(this).attr('y') || '0');
          const speed = 0.5 + Math.random() * 0.5;
          const direction = d3.select(this).attr('data-direction') || (Math.random() > 0.5 ? 'up' : 'down');
          const newY = direction === 'up' ? currentY - speed : currentY + speed;

          if (newY < 0) d3.select(this).attr('data-direction', 'down');
          if (newY > height) d3.select(this).attr('data-direction', 'up');
          return newY;
        })
        .attr('opacity', function() {
          return Math.sin(Date.now() * 0.001) * 0.3 + 0.7;
        });

      // 粒子连线逻辑
      const particleElements = particles.nodes();
      const positions = particleElements.map(el => ({
        x: parseFloat(d3.select(el).attr('x')),
        y: parseFloat(d3.select(el).attr('y')),
        element: el
      }));

      // 清除旧连线
      connections.selectAll('line').remove();

      // 创建新连线（带脉冲效果）
      const connectionPulse = Math.sin(Date.now() * 0.005) * 0.5 + 0.5;
      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          const dx = positions[i].x - positions[j].x;
          const dy = positions[i].y - positions[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            connections.append('line')
              .attr('x1', positions[i].x)
              .attr('y1', positions[i].y)
              .attr('x2', positions[j].x)
              .attr('y2', positions[j].y)
              .attr('stroke', `hsla(195, 70%, 60%, ${0.8 - distance / 100})`)
              .attr('stroke-width', 0.3 + connectionPulse * 0.5) // 连线脉冲动画
              .attr('stroke-dasharray', `5, ${5 + connectionPulse * 5}`) // 虚线动画
              .attr('pointer-events', 'none');
          }
        }
      }

      requestAnimationFrame(animate);
    };

    // 开始动画
    const animationId = requestAnimationFrame(animate);

    // 窗口大小调整处理
    const handleResize = () => {
      svg.attr('width', window.innerWidth)
         .attr('height', window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <svg ref={backgroundRef} className="code-background" />
  );
};

export default CodeBackground;