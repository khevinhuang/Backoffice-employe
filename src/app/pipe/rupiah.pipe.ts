import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rupiah',
})
export class RupiahPipe implements PipeTransform {
  transform(value: number): string {
    if (isNaN(value)) {
      return 'Rp ';
    }
    return 'Rp ' + value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  }
}
