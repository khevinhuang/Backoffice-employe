import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { first } from 'rxjs';
import { Employee, groupData } from 'src/app/models';
import { EmployeeService } from 'src/app/services';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  employee?: Employee | null;
  employees?: any;

  totalData?: number;
  searchValue: string = '';
  groupOptions = groupData;
  selectedGroup: string | null = null;

  dataSource: MatTableDataSource<Employee>;
  originalDataSource: MatTableDataSource<Employee>;

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;

  displayedColumns: Array<string> = [
    'firstName',
    'lastName',
    'email',
    'birthDate',
    'basicSalary',
    'group',
    'description',
    'action',
  ];

  constructor(private router: Router, private service: EmployeeService) {
    this.service.employeeData.subscribe((x) => (this.employee = x));

    this.employees = localStorage.getItem('employee-list');
    this.dataSource = new MatTableDataSource(JSON.parse(this.employees));
    this.originalDataSource = new MatTableDataSource(
      JSON.parse(this.employees)
    );
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator || null;
    this.dataSource.sort = this.sort || null;
    this.dataSource._updateChangeSubscription();
    this.originalDataSource.paginator = this.paginator || null;
    this.originalDataSource.sort = this.sort || null;
    this.originalDataSource._updateChangeSubscription();
  }

  ngOnInit(): void {
    this.service
      .getAll()
      .pipe(first())
      .subscribe((employees) => {
        this.employees = employees;
        this.totalData = employees.length;
      });
    const savedSearchValue = localStorage.getItem('searchValue');
    if (savedSearchValue) {
      this.searchValue = savedSearchValue;
      this.applyFiltertoTable(savedSearchValue);
    }
  }

  ngOnDestroy(): void {
    this.leavePage();
  }

  logout() {
    this.service.logout();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
    this.searchValue = filterValue;
    this.selectedGroup = null;
    this.applyFiltertoTable(filterValue);
    this.applyFilterToGroup();
  }

  applyFiltertoTable(searchValue: string) {
    this.dataSource.filter = searchValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onGroupSelectionChange(event: any) {
    if (event.value === null) {
      this.selectedGroup = null;
      this.applyFiltertoTable('');
    } else {
      this.selectedGroup = event.value;
      this.applyFilterToGroup(event.value);
    }
  }

  applyFilterToGroup(selectedGroup: any = '') {
    if (!selectedGroup) {
      this.dataSource.data = this.originalDataSource.data;
      this.applyFiltertoTable(this.searchValue);
      return;
    }

    const selectedGroupValue = selectedGroup.viewValue;

    const filteredData = this.originalDataSource.data.filter((item) => {
      if (item.group !== selectedGroupValue) {
        return false;
      }
      const firstName = item.firstName ? item.firstName.toLowerCase() : '';
      const lastName = item.lastName ? item.lastName.toLowerCase() : '';
      const email = item.email ? item.email.toLowerCase() : '';

      return (
        firstName.includes(this.searchValue) ||
        lastName.includes(this.searchValue) ||
        email.includes(this.searchValue)
      );
    });

    this.dataSource.data = filteredData;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onEdit(id: number) {
    this.router.navigate([`edit-employee/${id}`]);
  }

  goDetail(id: number) {
    this.router.navigate([`employee-detail/${id}`]);
  }

  deleteUser(id: any) {
    const user: any = this.employees?.find((x: any) => x.id === id);
    user.status = true;
    this.service
      .delete(id)
      .pipe(first())
      .subscribe(() => {
        this.employees = this.employees!.filter((x: any) => x.id !== id);
        this.totalData = this.employees?.length;
        this.dataSource.data = this.dataSource.data.filter(
          (item) => item.id != id
        );
        this.dataSource._updateChangeSubscription();
      });
  }

  leavePage() {
    localStorage.setItem('searchValue', this.searchValue);
  }

  toNumberCurrency(value: string) {
    return Number(value);
  }
}
