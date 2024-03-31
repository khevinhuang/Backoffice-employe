import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs';
import { groupData } from 'src/app/models';
import { EmployeeService } from 'src/app/services';

@Component({
  selector: 'app-add-edit',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss'],
})
export class AddEditComponent {
  addForm!: FormGroup;
  id?: string;
  title!: string;
  isloading: boolean = false;
  submitting: boolean = false;
  submitted: boolean = false;
  errorMessage?: string;

  currentRoute?: string;
  status?: string;
  isHide: boolean = false;

  groupOptions: Array<any> = new Array<any>();

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private service: EmployeeService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.initLoad();
  }

  initForm() {
    this.route.url.subscribe((route) => {
      this.currentRoute = route[0].path;
    });
    this.id = this.route.snapshot.params['id'];
    this.groupOptions = groupData;
    this.addForm = this.formBuilder.group({
      username: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      birthDate: ['', [Validators.required, this.validateBirthDate]],
      basicSalary: [null, [Validators.required]],
      group: ['', Validators.required],
      description: ['', Validators.required],
      status: ['', Validators.required],
      password: [
        '',
        [Validators.minLength(6), ...(!this.id ? [Validators.required] : [])],
      ],
    });
  }

  initLoad() {
    if (this.id) {
      this.title = 'Edit Data';
      this.isloading = true;
      this.service
        .getById(this.id)
        .pipe(first())
        .subscribe((x) => {
          this.addForm.patchValue(x);
          this.isloading = false;
          this.status = x.status === true ? 'Active' : 'Deactive';
        });
    }
    if (this.currentRoute === 'employee-detail') {
      this.title = 'Profile';
      this.isHide = true;
      this.addForm.controls['username']?.disable();
      this.addForm.controls['firstName']?.disable();
      this.addForm.controls['lastName']?.disable();
      this.addForm.controls['email']?.disable();
      this.addForm.controls['birthDate']?.disable();
      this.addForm.controls['basicSalary']?.disable();
      this.addForm.controls['group']?.disable();
      this.addForm.controls['description']?.disable();
      this.addForm.controls['status']?.disable();
      this.addForm.controls['password']?.disable();
      this.addForm.controls['password']?.disable();
    } else {
      this.title = 'Add New Employee';
    }
  }

  get f() {
    return this.addForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    if (this.addForm.invalid) {
      return;
    }

    this.submitting = true;
    this.saveUser()
      .pipe(first())
      .subscribe({
        next: () => {
          this.router.navigateByUrl('');
        },
        error: (error) => {
          this.submitting = false;
          this.errorMessage = error;
        },
      });
  }

  private saveUser() {
    return this.id
      ? this.service.update(this.id!, this.addForm.value)
      : this.service.register(this.addForm.value);
  }

  onCancel() {
    this.router.navigate([''], { relativeTo: this.route });
  }

  toNumberCurrency(value: string) {
    return Number(value);
  }

  validateBirthDate(control: AbstractControl): ValidationErrors | null {
    const selectedDate = new Date(control.value);
    const today = new Date();
    if (selectedDate > today) {
      return { invalidBirthDate: true };
    }
    return null;
  }

  onlyNumberValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const isValid = /^\d+$/.test(control.value);
      return isValid ? null : { onlyNumber: { value: control.value } };
    };
  }
}
