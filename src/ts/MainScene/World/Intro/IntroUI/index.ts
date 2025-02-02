import EventEmitter from "wolfy87-eventemitter";

export class IntroUI extends EventEmitter {
	private skipElm: HTMLElement;
	private skipBakuElm: HTMLElement;
	private skiptTxtElm: HTMLElement;
	private autoSkipTimeout: number | null = null;  // Track timeout for cleanup

	constructor() {
		super();

		this.skipElm = document.querySelector('.intro-skip')!;
		this.skipBakuElm = this.skipElm.querySelector('.intro-skip-baku')!;
		this.skiptTxtElm = this.skipElm.querySelector('.intro-skip-txt')!;
		this.skiptTxtElm.setAttribute('data-skipTxt', 'skip');
		
		// Existing click handler
		this.skipElm.addEventListener('click', this.handleSkipClick);
	}

	public switchSkipVisibility(visible: boolean) {
		this.skipElm.setAttribute('data-skipVisible', visible ? 'true' : 'false');
		
		if (visible) {
			// Automatically trigger skip after 1 second when visible
			this.autoSkipTimeout = window.setTimeout(() => {
				this.handleSkipClick();
			}, 1000);
		} else if (this.autoSkipTimeout) {
			// Clear pending auto-skip if hidden
			window.clearTimeout(this.autoSkipTimeout);
			this.autoSkipTimeout = null;
		}
	}

	private handleSkipClick = () => {
		// Clear any pending auto-skip
		if (this.autoSkipTimeout) {
			window.clearTimeout(this.autoSkipTimeout);
			this.autoSkipTimeout = null;
		}

		this.skiptTxtElm.setAttribute('data-skipTxt', 'ok');
		
		setTimeout(() => {
			this.switchSkipVisibility(false);
		}, 200);

		setTimeout(() => {
			this.emitEvent('skip');
		}, 1000);
	}

	// Cleanup
	public dispose() {
		if (this.autoSkipTimeout) {
			window.clearTimeout(this.autoSkipTimeout);
		}
		this.skipElm.removeEventListener('click', this.handleSkipClick);
	}
}