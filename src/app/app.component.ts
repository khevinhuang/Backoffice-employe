import { Component, OnDestroy } from '@angular/core';

import { Employee, dummyData } from './models';
import { EmployeeService } from './services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy {
  employee?: Employee | null;

  constructor(private service: EmployeeService) {
    this.service.employeeData.subscribe((x) => (this.employee = x));
  }

  ngOnInit(): void {
    localStorage.setItem('employee-list', JSON.stringify(dummyData));
  }

  ngOnDestroy(): void {
    localStorage.removeItem('employee-list');
    localStorage.removeItem('searchValue');
  }
}
