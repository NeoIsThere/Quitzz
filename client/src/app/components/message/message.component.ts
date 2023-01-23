import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Message } from 'src/app/interfaces/interface';
import { convertUTCToLocal, navigateTo, UTCToLocalConversionMode } from 'src/app/services/utils/utils';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css'],
})
export class MessageComponent implements OnInit {
  constructor(private router: Router) {}

  @Input()
  isRightSide: boolean;

  @Input()
  message: Message;

  ngOnInit(): void {}

  navigateToProfile() {
    navigateTo(this.router, 'profile/' + this.message.author);
  }

  getDate(message: Message){
    return convertUTCToLocal(message.date, UTCToLocalConversionMode.onlyTimeOrOnlyDay)
  }
}
