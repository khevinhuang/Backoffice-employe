import { Directive, ElementRef, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appRupiah]',
})
export class RupiahDirective {
  constructor(private el: ElementRef, private control: NgControl) {}

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const initialValue = this.el.nativeElement.value;
    const cursorPosition = this.el.nativeElement.selectionStart;

    // Remove non-numeric characters
    let cleanValue = initialValue.replace(/[^\d]/g, '');

    // Format the value into Rupiah format
    let formattedValue = '';
    let count = 0;
    for (let i = cleanValue.length - 1; i >= 0; i--) {
      formattedValue = cleanValue.charAt(i) + formattedValue;
      count++;
      if (count % 3 === 0 && i > 0) {
        formattedValue = '.' + formattedValue;
      }
    }

    // Update the input value and cursor position
    this.control.control?.setValue('Rp ' + formattedValue);
    this.el.nativeElement.setSelectionRange(
      cursorPosition + 3,
      cursorPosition + 3
    );
  }
}
