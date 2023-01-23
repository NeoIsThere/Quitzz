import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RANKING } from 'src/app/constants';
import { Rank } from 'src/app/interfaces/interface';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css'],
})
export class FaqComponent implements OnInit {

  RANKS: Rank[];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.navigateByUrl('faq');
    this.RANKS = JSON.parse(JSON.stringify(RANKING));
    this.RANKS.pop();
  }

  navigateTo(relativeUrl: string){
    this.router.navigateByUrl(relativeUrl);
  }


}
