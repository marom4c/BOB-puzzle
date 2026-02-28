import { Component, HostListener, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col items-center py-8 px-4 font-sans text-slate-800">
      <div class="max-w-md w-full bg-white rounded-3xl shadow-xl p-6 border border-slate-100">
        <h1 class="text-3xl font-extrabold text-center mb-6 text-slate-800 tracking-tight">Posuvné puzzle</h1>
        
        <div class="mb-6 w-full flex justify-center">
          <label class="cursor-pointer bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-2.5 px-5 rounded-xl shadow-sm transition-all flex items-center gap-2 w-full justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Nahrát vlastní obrázek
            <input type="file" class="hidden" accept="image/*" (change)="onImageUpload($event)">
          </label>
        </div>

        <div class="flex justify-between items-center mb-6">
          <div class="text-lg font-semibold bg-slate-100 px-4 py-2 rounded-xl text-slate-700">
            Tahy: <span class="text-indigo-600 font-bold">{{ moves() }}</span>
          </div>
          <button 
            (click)="shuffle()"
            class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95">
            Zamíchat
          </button>
        </div>

        <!-- Herní plocha 4x5 (poměr 4:5) -->
        <div class="relative w-full bg-slate-200 rounded-2xl overflow-hidden shadow-inner border-4 border-slate-200 mb-6 touch-none" style="aspect-ratio: 4 / 5;">
          
          <!-- Dekorativní levá horní část (místo pro logo/text jako u fyzické hračky) -->
          <div class="absolute top-0 left-0 w-[75%] h-[20%] bg-slate-200 flex items-center justify-center border-b-2 border-r-2 border-slate-300/50 z-0">
            <div class="flex flex-col items-center opacity-60">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mb-1 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
              </svg>
              <span class="text-lg font-black tracking-widest text-slate-600">PUZZLE</span>
            </div>
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
                [style.background-image]="tile.isEmpty ? 'none' : 'url(' + imageUrl + ')'"
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
                (click)="shuffle()"
                class="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-full transition-transform hover:scale-105 shadow-lg">
                Hrát znovu
              </button>
            </div>
          }
        </div>

        <div class="flex flex-col items-center bg-slate-50 p-4 rounded-2xl">
          <p class="text-sm text-slate-500 mb-3 font-semibold uppercase tracking-wider">Původní obrázek</p>
          <img [src]="imageUrl" alt="Předloha" referrerpolicy="no-referrer" class="w-32 h-32 object-cover rounded-xl shadow-md border-2 border-white">
        </div>
        
        <div class="mt-6 text-center text-sm text-slate-400">
          <p>K ovládání můžete použít dotyk, myš nebo šipky na klávesnici.</p>
        </div>
      </div>
    </div>
  `
})
export class App {
  gridCols = 4;
  gridRows = 5;
  // Validní indexy pro pohyb (3 je odkládací políčko vpravo nahoře, 4-19 je hlavní obrázek 4x4)
  validIndices = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
  
  imageUrl = 'https://picsum.photos/seed/puzzle/800/800';
  
  tiles = signal<{id: number, index: number, isEmpty: boolean}[]>([]);
  moves = signal(0);
  hasStarted = signal(false);

  isSolved = computed(() => {
    const currentTiles = this.tiles();
    if (currentTiles.length === 0) return false;
    
    // Zkontrolujeme, zda jsou všechny obrázkové dílky (id 0-15) na svých původních místech (index 4-19)
    return currentTiles.every(tile => tile.isEmpty || tile.index === tile.id + 4);
  });

  constructor() {
    this.initPuzzle();
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

  onImageUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imageUrl = e.target?.result as string;
        this.initPuzzle();
      };
      reader.readAsDataURL(file);
    }
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
