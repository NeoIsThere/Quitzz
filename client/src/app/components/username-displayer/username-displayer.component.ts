import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserDataService } from 'src/app/services/user-data/user-data.service';

@Component({
  selector: 'app-username-displayer',
  templateUrl: './username-displayer.component.html',
  styleUrls: ['./username-displayer.component.css'],
})
export class UsernameDisplayerComponent implements OnInit {
  constructor(private userData: UserDataService) {}

  ngOnInit(): void {
    this.userData.fetchUsername();
  }

  get username() {
    return this.userData.username.getValue();
  }
}
