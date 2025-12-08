import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, PLATFORM_ID, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-matrix-rain',
  standalone: true,
  template: '<div #rendererHost class="matrix-rain"></div>',
  styleUrl: './matrix-rain.component.css'
})
export class MatrixRainComponent implements AfterViewInit, OnDestroy {
  @ViewChild('rendererHost', { static: true }) rendererHost!: ElementRef<HTMLDivElement>;

  private fontSize = 18;
  private columns: number[] = [];
  private texture?: any;
  private canvas?: HTMLCanvasElement;
  private ctx?: CanvasRenderingContext2D | null;
  private renderer?: any;
  private scene?: any;
  private camera?: any;
  private animationFrameId?: number;
  private destroyed = false;
  private hasThreeRenderer = false;

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private readonly glyphs =
    'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヰヱヲン' +
    '0123456789' +
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
    'abcdefghijklmnopqrstuvwxyz' +
    'абвгдеёжзийклмнопрстуфхцчшщьыъэюя' +
    '齣龍風雨雲森林火水土金地空星宙海波光闇愛夢心善悪';

  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {}

  async ngAfterViewInit(): Promise<void> {
    if (!this.isBrowser) {
      return;
    }

    try {
      const three = await this.loadThree();
      if (this.destroyed) {
        return;
      }

      this.initScene(three);
      this.resetColumns();
      this.animate();
      window.addEventListener('resize', this.handleResize);
    } catch (error) {
      console.error('Failed to initialize matrix rain background', error);
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    if (this.isBrowser) {
      cancelAnimationFrame(this.animationFrameId ?? 0);
      window.removeEventListener('resize', this.handleResize);
      this.disposeThree();
    }
  }

  private handleResize = (): void => {
    if (!this.canvas) {
      return;
    }

    const { clientWidth, clientHeight } = this.rendererHost.nativeElement;
    const width = clientWidth || window.innerWidth;
    const height = clientHeight || window.innerHeight;

    this.canvas.width = width;
    this.canvas.height = height;
    if (this.renderer && this.hasThreeRenderer) {
      this.renderer.setSize(width, height);
    }
    this.resetColumns();
  };

  private async loadThree(): Promise<any | undefined> {
    try {
      const existingGlobal = (window as Window & { THREE?: any }).THREE;
      if (existingGlobal) {
        return existingGlobal;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.min.js';
      script.async = true;

      await new Promise<void>((resolve, reject) => {
        script.onload = () => resolve();
        script.onerror = (err) => reject(err);
        document.body.appendChild(script);
      });

      return (window as Window & { THREE?: any }).THREE;
    } catch (error) {
      console.warn('Falling back to canvas-only matrix rain (Three.js unavailable).', error);
      return undefined;
    }
  }

  private initScene(three?: any): void {
    const hostElement = this.rendererHost.nativeElement;
    const width = hostElement.clientWidth || window.innerWidth;
    const height = hostElement.clientHeight || window.innerHeight;

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = width;
    this.canvas.height = height;

    hostElement.innerHTML = '';

    if (three) {
      this.texture = new three.CanvasTexture(this.canvas);
      this.texture.minFilter = three.LinearFilter;
      this.texture.magFilter = three.NearestFilter;

      this.scene = new three.Scene();
      this.camera = new three.OrthographicCamera(-1, 1, 1, -1, 0, 10);
      this.camera.position.z = 1;

      const geometry = new three.PlaneGeometry(2, 2);
      const material = new three.MeshBasicMaterial({ map: this.texture, transparent: true });
      const mesh = new three.Mesh(geometry, material);
      this.scene.add(mesh);

      this.renderer = new three.WebGLRenderer({ alpha: true, antialias: true });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      hostElement.appendChild(this.renderer.domElement);
      this.hasThreeRenderer = true;
    } else {
      hostElement.appendChild(this.canvas);
      this.hasThreeRenderer = false;
    }
  }

  private resetColumns(): void {
    const width = this.canvas?.width ?? window.innerWidth;
    const columnsCount = Math.ceil(width / this.fontSize);
    this.columns = Array.from({ length: columnsCount }, () => Math.floor(Math.random() * -20));
  }

  private animate = (): void => {
    if (this.destroyed || !this.ctx || !this.canvas) {
      return;
    }

    this.drawCharacters();
    if (this.texture && this.renderer && this.scene && this.camera && this.hasThreeRenderer) {
      this.texture.needsUpdate = true;
      this.renderer.render(this.scene, this.camera);
    }
    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  private drawCharacters(): void {
    if (!this.ctx || !this.canvas) {
      return;
    }

    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = '#50ff56';
    ctx.shadowColor = 'rgba(80, 255, 86, 0.35)';
    ctx.shadowBlur = 8;
    ctx.font = `${this.fontSize}px "JetBrains Mono", "Cascadia Code", "Fira Code", monospace`;

    const characters = Array.from(this.glyphs);
    for (let index = 0; index < this.columns.length; index += 1) {
      const char = characters[Math.floor(Math.random() * characters.length)];
      const x = index * this.fontSize;
      const y = this.columns[index] * this.fontSize;

      ctx.fillText(char, x, y);

      if (y > this.canvas.height && Math.random() > 0.975) {
        this.columns[index] = 0;
      } else {
        this.columns[index] += 1;
      }
    }
  }

  private disposeThree(): void {
    if (this.renderer) {
      this.renderer.dispose?.();
      this.renderer.forceContextLoss?.();
      this.renderer = undefined;
    }

    this.scene = undefined;
    this.camera = undefined;
    this.texture = undefined;
    this.ctx = undefined;
    this.canvas = undefined;
  }
}