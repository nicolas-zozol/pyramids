import { MODE } from './mode'

interface AutocompleteBoxOptions {
  container: HTMLElement // The parent `position: relative` container
  fetch: (matchString: string) => Promise<string[]> // Fetch logic for autocomplete items
  onSelect: (selectedItem: string) => void // Callback when an item is selected
  onClose: () => void // callback when the box is dismissed
  onNoMatch(matchString: string): void // callback when no match is found
}

let singleton: AutocompleteBox | undefined = undefined

export function isBoxOpened(): boolean {
  return singleton !== undefined
}

export function isModeOpened(mode: MODE): boolean {
  return singleton !== undefined && singleton.mode === mode
}

export function getAutocompleteBox(): AutocompleteBox | undefined {
  return singleton
}

export function setAutocompleteBox(box: AutocompleteBox) {
  singleton = box
}

export function resetAutocompleteBox() {
  singleton = undefined
}

interface ActiveItem {
  found:
    | boolean
    | {
        index: number
        item: string
      }
}

export class AutocompleteBox {
  private container: HTMLElement
  private readonly fetch: (matchString: string) => Promise<string[]>
  public onSelect: (selectedItem: string) => void
  public onClose: () => void
  public onNoMatch: (matchString: string) => void
  private box: HTMLDivElement
  private items: string[] = []
  htmlItems: HTMLDivElement[] = []
  private activeIndex: number = -1 // For keyboard navigation
  private lastActiveItem: string | undefined = undefined

  constructor(
    public mode: MODE,
    options: AutocompleteBoxOptions
  ) {
    const { container, fetch, onSelect, onClose, onNoMatch } = options
    this.container = container
    this.fetch = fetch
    this.onSelect = onSelect
    this.onClose = onClose
    this.onNoMatch = onNoMatch

    this.box = this.initBox()
  }

  /**
   * Sets the position of the autocomplete box relative to its container.
   * @param x - The x-coordinate.
   * @param y - The y-coordinate.
   */
  setPosition(x: number, y: number): void {
    this.box.style.left = `${x}px`
    this.box.style.top = `${y}px`
    this.box.style.position = 'absolute'
  }

  /**
   * Updates the items in the autocomplete box based on the input.
   * @param input - The input string to fetch items for.
   */
  async update(input: string): Promise<ActiveItem> {
    this.items = await this.fetch(input)
    this.render()
    const active = this.updateActive(input)
    if (!active.found) {
      this.onNoMatch(input)
    }
    return active
  }

  private initBox(): HTMLDivElement {
    this.activeIndex = 0
    const box = document.createElement('div')
    box.className = 'autocomplete-box'
    this.container.appendChild(box)
    this.container.classList.add('autocomplete-root')

    setAutocompleteBox(this)
    return box
  }

  /**
   * Renders the items in the autocomplete box.
   */
  private render(): void {
    this.box.innerHTML = ''
    this.htmlItems = []
    this.items.forEach((item, index) => {
      const suggestionItem = document.createElement('div')
      suggestionItem.setAttribute('data-index', index.toString())
      suggestionItem.className = 'suggestion-item'
      suggestionItem.textContent = item
      this.box.appendChild(suggestionItem)
      this.htmlItems.push(suggestionItem)
    })

    // click event:  selecting item on click
    this.htmlItems.forEach((item, index) => {
      item.addEventListener('click', () => {
        this.selectItem(index)
      })
    })

    // mouseover event:  setting htmlItem active on hovering
    this.htmlItems.forEach(item => {
      item.addEventListener('mouseover', () => {
        const itemIndex = Number(item.getAttribute('data-index') || '0')
        item.classList.add('active')
        this.setActiveIndex(itemIndex)
      })
    })
  }

  private updateActive(matchString: string): ActiveItem {
    let newActiveIndex = 0
    const continueOnTheSameGuy =
      this.lastActiveItem &&
      this.lastActiveItem.toLowerCase().startsWith(matchString.toLowerCase())

    if (continueOnTheSameGuy) {
      newActiveIndex = this.items.indexOf(this.lastActiveItem!)
    }
    return this.setActiveIndex(newActiveIndex)
  }

  private setActiveIndex(index: number): ActiveItem {
    this.activeIndex = index
    if (this.htmlItems[this.activeIndex]) {
      this.htmlItems[this.activeIndex].classList.add('active')
      this.lastActiveItem = this.items[this.activeIndex]
      this.htmlItems.forEach((i, idx) => {
        if (idx !== this.activeIndex) {
          i.classList.remove('active')
        }
      })
      return {
        found: {
          index: this.activeIndex,
          item: this.items[this.activeIndex],
        },
      }
    } else {
      this.activeIndex = -1
      this.lastActiveItem = undefined
      // this.exit() // handled by the caller
      return {
        found: false,
      }
    }
  }

  getActiveItem(): string | undefined {
    return this.lastActiveItem
  }

  /**
   * Closes the autocomplete box and triggers the onClose callback if provided.
   */
  close(): void {
    if (this.onClose) {
      // should replace the text inside the temporary node
      this.onClose()
    }

    this.exit() // should replace
  }

  // close without triggering selection
  exit(): void {
    this.box.remove()
    this.htmlItems.forEach(item => item.remove())

    this.container.classList.remove('autocomplete-root')
    resetAutocompleteBox()
  }

  // Selects an item programmatically
  private selectItem(index: number): void {
    if (index < 0 || index >= this.items.length) return

    const selectedItem = this.items[index]
    this.onSelect(selectedItem)
    //this.close()
  }

  // Handles keyboard navigation
  public handleKeyDown(key: string): void {
    if (!this.box || this.items.length === 0) return
    const size = this.items.length

    switch (key) {
      case 'ArrowDown':
        const activeIndex = Math.min(this.activeIndex + 1, size - 1)
        console.log('## activeIndex', this.activeIndex, activeIndex)
        this.setActiveIndex(activeIndex)
        this.scrollToActiveItem(activeIndex)
        break
      case 'ArrowUp':
        const activeIndexUp = Math.max(this.activeIndex - 1, 0)
        this.setActiveIndex(activeIndexUp)
        this.scrollToActiveItem(activeIndexUp)
        break
      case 'Enter':
        if (this.activeIndex !== -1) {
          this.selectItem(this.activeIndex)
        }
        break
      case 'Escape':
        console.log('closing')
        this.close()
        break
      case 'Space':
        if (this.mode === 'HASHTAG' && this.activeIndex !== -1) {
          this.selectItem(this.activeIndex)
        }
        break
    }
  }
  private scrollToActiveItem(index: number): void {
    if (this.htmlItems[index]) {
      this.htmlItems[index].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      })
    }
  }

  public setContinueAndEnterItem(matchString: string) {
    const continueItem = document.createElement('div')
    continueItem.textContent = 'Continue typing...'
    continueItem.classList.add('continue-item')
    this.box.appendChild(continueItem)
    this.htmlItems = [continueItem]
    this.activeIndex = -1
    this.lastActiveItem = matchString
  }
}
