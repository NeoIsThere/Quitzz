import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-simple-dialog',
  templateUrl: './simple-dialog.component.html',
  styleUrls: ['./simple-dialog.component.css']
})
export class SimpleDialogComponent implements OnInit {

  title: string;
  body: string;

  constructor() { }

  ngOnInit(): void {
  }

}
