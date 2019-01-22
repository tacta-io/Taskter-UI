import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormControl, FormGroup, FormGroupDirective } from '@angular/forms';
import { UserService } from '../../../shared/services/user.service';
import { Validators } from '@angular/forms';
import * as moment from 'moment';
import {
  TimesheetService,
  UserProject,
  NewEntry
} from '../../services/timesheet.service';
import { User } from 'src/app/shared/models/user.model';

@Component({
  selector: 'tsk-time-entry-dialogue',
  templateUrl: './time-entry-dialogue.component.html',
  styleUrls: ['./time-entry-dialogue.component.scss']
})
export class TimeEntryDialogueComponent implements OnInit {
  currentUser: User = {} as User;
  currentDate: moment.Moment;
  userProjects: UserProject[] = [];
  TimeEntryForm: FormGroup;
  @ViewChild('form') form: FormGroupDirective;

  constructor(
    public dialogRef: MatDialogRef<TimeEntryDialogueComponent>,
    @Inject(MAT_DIALOG_DATA) public data: moment.Moment,
    private userService: UserService,
    private timeEntryService: TimesheetService
  ) {}

  ngOnInit(): void {
    this.currentDate = this.data;
    this.getCurrentUser();
    this.getUserProjects();
    this.TimeEntryForm = new FormGroup({
      project: new FormControl(null, [Validators.required]),
      task: new FormControl({ value: null, disabled: true }, [
        Validators.required
      ]),
      hours: new FormControl(null, [Validators.required]),
      minutes: new FormControl(null, [Validators.required]),
      notes: new FormControl(null)
    });

  }

  get f(): any {
    return this.TimeEntryForm.controls;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  toggleTaskDropdown() {
    this.f.task.reset();
    if (this.f.task.status === 'DISABLED') {
      this.f.task.enable();
    } else {
      this.f.task.disable();
    }
  }

  onSubmit() {
    if (this.TimeEntryForm.invalid || this.TimeEntryForm.untouched) {
      return;
    }

    this.postNewEntry();
    this.form.resetForm();
    this.onNoClick();
  }

  getCurrentUser(): void {
    this.userService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
  }

  getUserProjects(): void {
    this.timeEntryService.getProjectsForCurrentUser().subscribe(
      projects => {
        this.userProjects = projects;
      },
      err => {
        console.log(err);
      }
    );
  }

  postNewEntry() {
    const entry: NewEntry = {
      userId: this.currentUser.userId,
      projectTaskId: this.TimeEntryForm.controls['task'].value['taskID'],
      durationInMin:
        this.TimeEntryForm.controls['hours'].value * 60 +
        this.TimeEntryForm.controls['minutes'].value,
      note: this.TimeEntryForm.controls['notes'].value,
      day: this.currentDate.date(),
      month: this.currentDate.month() + 1,
      year: this.currentDate.year()
    };

    this.timeEntryService.addTimeEntry(entry).subscribe(
      () => {},
      err => {
        console.error(err);
      }
    );
  }
}
