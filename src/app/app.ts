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
            <!-- Dočasné logo, než uživatel dodá veřejný odkaz -->
            <img src="https://placehold.co/300x100/00a0e3/ffffff?text=BO!+Reality+%26+Finance" alt="BO! Logo" class="h-12 object-contain rounded">
          </div>
          <h1 class="text-2xl font-extrabold text-center mb-6 text-slate-800 tracking-tight">Vyberte si obrázek k sestavení</h1>
          
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

          <!-- Herní plocha 4x5 (poměr 4:5) -->
          <div class="relative w-full bg-slate-200 rounded-2xl overflow-hidden shadow-inner border-4 border-slate-200 mb-6 touch-none" style="aspect-ratio: 4 / 5;">
            
            <!-- Dekorativní levá horní část (logo BO!) -->
            <div class="absolute top-0 left-0 w-[75%] h-[20%] bg-white flex items-center justify-center border-b-2 border-r-2 border-slate-300/50 z-0 p-3">
              <img src="https://placehold.co/300x100/00a0e3/ffffff?text=BO!+Reality+%26+Finance" alt="BO! Logo" class="max-h-full max-w-full object-contain opacity-90 rounded">
            </div>
            
            <!-- Naznačení odkládacího políčka vpravo nahoře -->
            <div class="absolute top-0 right-0 w-[25%] h-[20%] p-1 z-0">
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
                  [style.background-size]="'400% 400%'"
                  [style.background-position]="getBackgroundPosition(tile.id)"
                ></div>
              </div>
            }
            
            @if (isSolved() && hasStarted()) {
              <div class="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-20 animate-in fade-in duration-500 rounded-xl">
                <h2 class="text-4xl font-black text-emerald-500 mb-2 drop-shadow-sm">Výborně!</h2>
                <p class="text-lg font-medium text-slate-700 mb-6">Složeno na <span class="font-bold">{{ moves() }}</span> tahů</p>
                <button 
                  (click)="backToSelection()"
                  class="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-full transition-transform hover:scale-105 shadow-lg">
                  Vybrat další obrázek
                </button>
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
  
  // Dočasné funkční obrázky, než uživatel dodá veřejné odkazy
  availableImages = [
    'https://picsum.photos/seed/puzzle1/800/800',
    'https://picsum.photos/seed/puzzle2/800/800',
    'https://picsum.photos/seed/puzzle3/800/800',
    'https://picsum.photos/seed/puzzle4/800/800'
  ];
  
  imageUrl = signal<string>('');
  
  gridCols = 4;
  gridRows = 5;
  // Validní indexy pro pohyb (3 je odkládací políčko vpravo nahoře, 4-19 je hlavní obrázek 4x4)
  validIndices = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
  
  tiles = signal<{id: number, index: number, isEmpty: boolean}[]>([]);
  moves = signal(0);
  hasStarted = signal(false);

  isSolved = computed(() => {
    const currentTiles = this.tiles();
    if (currentTiles.length === 0) return false;
    
    // Zkontrolujeme, zda jsou všechny obrázkové dílky (id 0-15) na svých původních místech (index 4-19)
    return currentTiles.every(tile => tile.isEmpty || tile.index === tile.id + 4);
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
    
    // Vytvoříme 16 dílků obrázku (id 0-15), které umístíme na indexy 4-19 (řádky 1-4)
    for (let i = 0; i < 16; i++) {
      newTiles.push({
        id: i,
        index: i + 4,
        isEmpty: false
      });
    }
    
    // Vytvoříme 1 prázdné odkládací políčko na indexu 3 (řádek 0, sloupec 3 - vpravo nahoře)
    newTiles.push({
      id: 16,
      index: 3,
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
      width: '25%', // 100% / 4 sloupce
      height: '20%', // 100% / 5 řádků
      left: `${col * 25}%`,
      top: `${row * 20}%`
    };
  }

  getBackgroundPosition(id: number): string {
    if (id === 16) return '0% 0%'; // Prázdné políčko
    
    // id 0-15 tvoří mřížku 4x4
    const col = id % 4;
    const row = Math.floor(id / 4);
    const x = (col / 3) * 100;
    const y = (row / 3) * 100;
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
    
    // Po zamíchání zajistíme, aby prázdné políčko skončilo zpět v odkládacím prostoru (index 3)
    // Tím zajistíme, že herní plocha 4x4 bude plná zamíchaných dílků
    while (emptyIndex !== 3) {
      let nextIndex = -1;
      const col = emptyIndex % this.gridCols;
      const row = Math.floor(emptyIndex / this.gridCols);
      
      if (col < 3) {
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

    if (this.validIndices.includes(up)) neighbors.push(up);
    if (this.validIndices.includes(down)) neighbors.push(down);
    if (col > 0 && this.validIndices.includes(left)) neighbors.push(left);
    if (col < this.gridCols - 1 && this.validIndices.includes(right)) neighbors.push(right);

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
}
