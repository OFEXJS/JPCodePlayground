import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const CodeBackground: React.FC = () => {
  const backgroundRef = useRef<SVGSVGElement>(null);

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

    // 创建粒子群
    const particleCount = 150;
    const particles = svg.selectAll('text')
      .data(d3.range(particleCount))
      .enter()
      .append('text')
      .text(d => codeChars[Math.floor(Math.random() * codeChars.length)])
      .attr('x', d => Math.random() * width)
      .attr('y', d => Math.random() * height)
      .attr('fill', () => `rgba(${Math.random() * 100 + 155}, ${Math.random() * 100 + 155}, ${Math.random() * 100 + 155}, ${Math.random() * 0.5 + 0.3})`)
      .attr('font-size', d => Math.random() * 10 + 8)
      .attr('pointer-events', 'none');

    // 动画函数
    const animate = () => {
      particles
        .attr('y', d => {
          const currentY = parseFloat(d3.select(d3.event.target).attr('y') || '0');
          return currentY > height ? 0 : currentY + (Math.random() * 3 + 1);
        })
        .attr('x', d => {
          const currentX = parseFloat(d3.select(d3.event.target).attr('x') || '0');
          return Math.random() > 0.98 ? currentX + (Math.random() * 10 - 5) : currentX;
        })
        .text(d => Math.random() > 0.95 ? codeChars[Math.floor(Math.random() * codeChars.length)] : d3.select(d3.event.target).text());

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