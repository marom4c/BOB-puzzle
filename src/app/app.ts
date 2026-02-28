import { Component, HostListener, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col items-center py-8 px-4 font-sans text-slate-800">
      <div class="max-w-md w-full bg-white rounded-3xl shadow-xl p-6 border border-slate-100">
        
        @if (gameState() === 'selection') {
          <div class="flex justify-center mb-6">
            <!-- Logo BO! -->
            <img src="logo.png" alt="BO! Logo" class="h-12 object-contain rounded">
          </div>
          
          <h1 class="text-xl font-extrabold text-center mb-4 text-slate-800 tracking-tight">1. Vyberte obtížnost</h1>
          <div class="flex justify-center gap-3 mb-8">
            <button 
              (click)="difficulty.set('3x3')"
              [class.bg-indigo-600]="difficulty() === '3x3'"
              [class.text-white]="difficulty() === '3x3'"
              [class.bg-slate-100]="difficulty() !== '3x3'"
              [class.text-slate-600]="difficulty() !== '3x3'"
              class="flex-1 py-3 rounded-xl font-bold transition-all shadow-sm hover:shadow-md">
              3x3 (Lehké)
            </button>
            <button 
              (click)="difficulty.set('4x4')"
              [class.bg-indigo-600]="difficulty() === '4x4'"
              [class.text-white]="difficulty() === '4x4'"
              [class.bg-slate-100]="difficulty() !== '4x4'"
              [class.text-slate-600]="difficulty() !== '4x4'"
              class="flex-1 py-3 rounded-xl font-bold transition-all shadow-sm hover:shadow-md">
              4x4 (Těžké)
            </button>
          </div>

          <h1 class="text-xl font-extrabold text-center mb-4 text-slate-800 tracking-tight">2. Vyberte obrázek</h1>
          
          <div class="grid grid-cols-2 gap-4">
            @for (img of availableImages; track img) {
              <button 
                (click)="selectImage(img)" 
                class="rounded-2xl overflow-hidden border-4 border-transparent hover:border-indigo-500 transition-all shadow-sm hover:shadow-md hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-500/50">
                <img [src]="img" class="w-full aspect-square object-cover" referrerpolicy="no-referrer">
              </button>
            }
          </div>
        } @else {
          <div class="flex items-center justify-between mb-6">
            <button 
              (click)="backToSelection()"
              class="text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1 font-medium text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
              </svg>
              Zpět
            </button>
            <h1 class="text-2xl font-extrabold text-slate-800 tracking-tight">Posuvné puzzle</h1>
            <div class="w-16"></div> <!-- Spacer for centering -->
          </div>

          <div class="flex justify-between items-center mb-6 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div class="flex flex-col items-center justify-center bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 min-w-[80px]">
              <span class="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">Tahy</span>
              <span class="text-xl text-indigo-600 font-black leading-none">{{ moves() }}</span>
            </div>
            
            <div class="flex flex-col items-center">
              <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Předloha</span>
              <img [src]="imageUrl()" class="w-14 h-14 object-cover rounded-lg shadow-sm border-2 border-white" referrerpolicy="no-referrer">
            </div>

            <button 
              (click)="shuffle()"
              class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 flex flex-col items-center justify-center min-w-[80px]">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span class="text-xs">Zamíchat</span>
            </button>
          </div>

          <!-- Herní plocha -->
          <div class="relative w-full bg-slate-200 rounded-2xl overflow-hidden shadow-inner border-4 border-slate-200 mb-6 touch-none" 
               [style.aspect-ratio]="difficulty() === '4x4' ? '4 / 5' : '3 / 4'">
            
            <!-- Dekorativní levá horní část (logo BO!) -->
            <div class="absolute top-0 left-0 bg-white flex items-center justify-center border-b-2 border-r-2 border-slate-300/50 z-0 p-3"
                 [style.width]="difficulty() === '4x4' ? '75%' : '66.666%'"
                 [style.height]="(100 / gridRows) + '%'">
              <img src="logo.png" alt="BO! Logo" class="max-h-full max-w-full object-contain opacity-90 rounded">
            </div>
            
            <!-- Naznačení odkládacího políčka vpravo nahoře -->
            <div class="absolute top-0 right-0 p-1 z-0"
                 [style.width]="difficulty() === '4x4' ? '25%' : '33.333%'"
                 [style.height]="(100 / gridRows) + '%'">
              <div class="w-full h-full rounded-lg border-2 border-dashed border-slate-400/40 flex flex-col items-center justify-center bg-slate-100/50">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-400 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Odložit</span>
              </div>
            </div>

            <!-- Samotné kostičky -->
            @for (tile of tiles(); track tile.id) {
              <div 
                class="absolute p-0.5 transition-all duration-200 ease-in-out cursor-pointer"
                [ngStyle]="getTileStyle(tile.index)"
                [class.invisible]="tile.isEmpty"
                [class.z-10]="!tile.isEmpty"
                (click)="moveTile(tile.index)"
              >
                <div 
                  class="w-full h-full rounded-lg shadow-sm border border-black/10 bg-white"
                  [style.background-image]="tile.isEmpty ? 'none' : 'url(' + imageUrl() + ')'"
                  [style.background-size]="difficulty() === '4x4' ? '400% 400%' : '300% 300%'"
                  [style.background-position]="getBackgroundPosition(tile.id)"
                ></div>
              </div>
            }
            
            @if (isSolved() && hasStarted()) {
              <div class="absolute inset-0 bg-white/40 backdrop-blur-sm flex flex-col items-center justify-center z-20 animate-in fade-in duration-500 rounded-xl p-4 text-center">
                <div class="bg-white/80 p-6 rounded-3xl shadow-xl border border-white/50 backdrop-blur-md w-full max-w-[90%]">
                  <h2 class="text-3xl sm:text-4xl font-black text-emerald-600 mb-2 drop-shadow-sm">BOmba práce!</h2>
                  <h3 class="text-xl sm:text-2xl font-bold text-slate-800 mb-4">Gratulujeme BOrče!</h3>
                  <p class="text-lg font-medium text-slate-700 mb-6 inline-block bg-white/60 px-4 py-1.5 rounded-full border border-slate-200">
                    Složeno na <span class="font-bold text-indigo-600">{{ moves() }}</span> tahů
                  </p>
                  
                  <div class="flex flex-col gap-3 w-full">
                    <button 
                      (click)="shareResult()"
                      class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-2xl transition-transform hover:scale-105 shadow-lg flex items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Pochlubit se
                    </button>
                    <button 
                      (click)="backToSelection()"
                      class="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-2xl transition-transform hover:scale-105 shadow-md">
                      Vybrat další obrázek
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
          
          <div class="mt-2 text-center text-sm text-slate-400">
            <p>K ovládání můžete použít dotyk, myš nebo šipky na klávesnici.</p>
          </div>
        }
      </div>
    </div>
  `
})
export class App {
  gameState = signal<'selection' | 'playing'>('selection');
  difficulty = signal<'3x3' | '4x4'>('4x4');
  
  // Dočasné funkční obrázky, než uživatel dodá veřejné odkazy
  availableImages = [
    'bob1',
    'bob2',
    'bob3',
    'bob4'
  ];
  
  imageUrl = signal<string>('');
  
  get gridCols() { return this.difficulty() === '4x4' ? 4 : 3; }
  get gridRows() { return this.difficulty() === '4x4' ? 5 : 4; }
  get storageIndex() { return this.gridCols - 1; }
  get numTiles() { return this.gridCols * this.gridCols; }
  
  get validIndices() {
    const indices = [this.storageIndex];
    const startIdx = this.gridCols;
    const endIdx = this.gridCols + this.numTiles - 1;
    for (let i = startIdx; i <= endIdx; i++) {
      indices.push(i);
    }
    return indices;
  }
  
  tiles = signal<{id: number, index: number, isEmpty: boolean}[]>([]);
  moves = signal(0);
  hasStarted = signal(false);

  isSolved = computed(() => {
    const currentTiles = this.tiles();
    if (currentTiles.length === 0) return false;
    
    const offset = this.gridCols;
    return currentTiles.every(tile => tile.isEmpty || tile.index === tile.id + offset);
  });

  selectImage(img: string) {
    this.imageUrl.set(img);
    this.gameState.set('playing');
    this.initPuzzle();
    // Automaticky zamíchat po výběru
    setTimeout(() => {
      this.shuffle();
    }, 100);
  }

  backToSelection() {
    this.gameState.set('selection');
  }

  initPuzzle() {
    const newTiles = [];
    const num = this.numTiles;
    const offset = this.gridCols;
    
    for (let i = 0; i < num; i++) {
      newTiles.push({
        id: i,
        index: i + offset,
        isEmpty: false
      });
    }
    
    newTiles.push({
      id: num,
      index: this.storageIndex,
      isEmpty: true
    });

    this.tiles.set(newTiles);
    this.moves.set(0);
    this.hasStarted.set(false);
  }

  getTileStyle(index: number) {
    const col = index % this.gridCols;
    const row = Math.floor(index / this.gridCols);
    return {
      width: `${100 / this.gridCols}%`,
      height: `${100 / this.gridRows}%`,
      left: `${col * (100 / this.gridCols)}%`,
      top: `${row * (100 / this.gridRows)}%`
    };
  }

  getBackgroundPosition(id: number): string {
    if (id === this.numTiles) return '0% 0%'; // Prázdné políčko
    
    const cols = this.gridCols;
    const col = id % cols;
    const row = Math.floor(id / cols);
    const x = (col / (cols - 1)) * 100;
    const y = (row / (cols - 1)) * 100;
    return `${x}% ${y}%`;
  }

  shuffle() {
    let currentTiles = [...this.tiles()];
    let emptyTile = currentTiles.find(t => t.isEmpty)!;
    let emptyIndex = emptyTile.index;
    let previousEmptyIndex = -1;
    
    // Provedeme 150 náhodných platných tahů
    for (let i = 0; i < 150; i++) {
      const neighbors = this.getNeighbors(emptyIndex);
      const validNeighbors = neighbors.filter(n => n !== previousEmptyIndex);
      const nextIndex = validNeighbors.length > 0 
        ? validNeighbors[Math.floor(Math.random() * validNeighbors.length)]
        : neighbors[Math.floor(Math.random() * neighbors.length)];
        
      const tileToMove = currentTiles.find(t => t.index === nextIndex)!;
      
      emptyTile.index = nextIndex;
      tileToMove.index = emptyIndex;
      
      previousEmptyIndex = emptyIndex;
      emptyIndex = nextIndex;
    }
    
    // Po zamíchání zajistíme, aby prázdné políčko skončilo zpět v odkládacím prostoru
    const storage = this.storageIndex;
    while (emptyIndex !== storage) {
      let nextIndex = -1;
      const col = emptyIndex % this.gridCols;
      const row = Math.floor(emptyIndex / this.gridCols);
      
      if (col < this.gridCols - 1) {
        nextIndex = emptyIndex + 1; // Posun prázdného místa doprava
      } else if (row > 0) {
        nextIndex = emptyIndex - this.gridCols; // Posun prázdného místa nahoru
      }
      
      if (nextIndex !== -1 && this.validIndices.includes(nextIndex)) {
        const tileToMove = currentTiles.find(t => t.index === nextIndex)!;
        emptyTile.index = nextIndex;
        tileToMove.index = emptyIndex;
        emptyIndex = nextIndex;
      } else {
        break; // Pojistka
      }
    }
    
    this.tiles.set(currentTiles);
    this.moves.set(0);
    this.hasStarted.set(true);
  }

  getNeighbors(index: number): number[] {
    const neighbors = [];
    const col = index % this.gridCols;

    const up = index - this.gridCols;
    const down = index + this.gridCols;
    const left = index - 1;
    const right = index + 1;

    const valid = this.validIndices;
    if (valid.includes(up)) neighbors.push(up);
    if (valid.includes(down)) neighbors.push(down);
    if (col > 0 && valid.includes(left)) neighbors.push(left);
    if (col < this.gridCols - 1 && valid.includes(right)) neighbors.push(right);

    return neighbors;
  }

  moveTile(index: number) {
    if (this.gameState() !== 'playing') return;
    if (this.isSolved() && this.hasStarted()) return;

    const currentTiles = [...this.tiles()];
    const emptyTile = currentTiles.find(t => t.isEmpty)!;
    const clickedTile = currentTiles.find(t => t.index === index)!;
    
    if (this.getNeighbors(emptyTile.index).includes(index)) {
      const tempIndex = emptyTile.index;
      emptyTile.index = clickedTile.index;
      clickedTile.index = tempIndex;
      
      this.tiles.set(currentTiles);
      if (!this.hasStarted()) {
        this.hasStarted.set(true);
      }
      this.moves.update(m => m + 1);
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (this.gameState() !== 'playing') return;
    if (this.isSolved() && this.hasStarted()) return;

    const currentTiles = this.tiles();
    const emptyTile = currentTiles.find(t => t.isEmpty)!;
    const emptyIndex = emptyTile.index;

    let targetIndex = -1;

    switch (event.key) {
      case 'ArrowUp': targetIndex = emptyIndex + this.gridCols; break;
      case 'ArrowDown': targetIndex = emptyIndex - this.gridCols; break;
      case 'ArrowLeft': targetIndex = emptyIndex + 1; break;
      case 'ArrowRight': targetIndex = emptyIndex - 1; break;
    }

    if (this.validIndices.includes(targetIndex) && this.getNeighbors(emptyIndex).includes(targetIndex)) {
      event.preventDefault();
      this.moveTile(targetIndex);
    }
  }

  async shareResult() {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Nastavíme velikost plátna
      canvas.width = 800;
      canvas.height = 800;

      // Načteme aktuální obrázek
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = this.imageUrl();

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Vykreslíme obrázek na pozadí
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Přidáme poloprůhledný překryv, aby byl text čitelný
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Vykreslíme texty
      ctx.textAlign = 'center';
      
      ctx.fillStyle = '#059669'; // emerald-600
      ctx.font = 'bold 70px sans-serif';
      ctx.fillText('BOmba práce!', canvas.width / 2, canvas.height / 2 - 60);
      
      ctx.fillStyle = '#1e293b'; // slate-800
      ctx.font = 'bold 50px sans-serif';
      ctx.fillText('Gratulujeme BOrče!', canvas.width / 2, canvas.height / 2 + 10);
      
      ctx.fillStyle = '#4f46e5'; // indigo-600
      ctx.font = 'bold 40px sans-serif';
      ctx.fillText(`Složeno na ${this.moves()} tahů`, canvas.width / 2, canvas.height / 2 + 90);

      // Převedeme canvas na soubor a nasdílíme
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], 'bo-puzzle-vysledek.png', { type: 'image/png' });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'BO! Puzzle',
            text: `Složil jsem BO! Puzzle na ${this.moves()} tahů! Zkus to taky.`,
            files: [file]
          });
        } else {
          // Fallback: Pokud zařízení nepodporuje sdílení souborů (např. starší desktop prohlížeče), stáhneme obrázek
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'bo-puzzle-vysledek.png';
          a.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    } catch (err) {
      console.error('Chyba při sdílení:', err);
      alert('Sdílení se nezdařilo. Zkuste to prosím znovu.');
    }
  }
}
