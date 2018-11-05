import { Component, OnInit } from '@angular/core';
import { RedditService } from '../services/reddit.service';
import { DataService } from '../services/data.service';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  constructor(
    public redditService: RedditService,
    private dataService: DataService,
    private modalControler: ModalController
  ) { }

  ngOnInit() {
  }

  close() {
    this.modalControler.dismiss();
  }

  save() {
    this.dataService.saveData(this.redditService.settings);
    this.close();
  }

}
