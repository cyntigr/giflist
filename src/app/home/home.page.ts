import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { DataService } from '../services/data.service';
import { RedditService } from '../services/reddit.service';
import { ModalController } from '@ionic/angular';
import { debounce, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Plugins } from '@capacitor/core';
import { SettingsPage } from '../settings/settings.page';
const { Browser,Keyboard } = Plugins;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  ngOnInit(): void {
    this.redditService.load();
    this.subredditForm.get('subredditControl').valueChanges.pipe(
      debounceTime(1500), distinctUntilChanged(),
    ).subscribe(data => {
      if (data.length > 0) {
        this.redditService.changeSubreddit(data);
      }
    });
  }

  // public 
  subredditForm: FormGroup;
  constructor(
    private dataService: DataService,
    public redditService: RedditService,
    private modalController: ModalController
  ) {
    this.subredditForm = new FormGroup({
      subredditControl: new FormControl('')
    });
  }
  showComments(post): void {
    Browser.open({
      toolbarColor: '@fff',
      url: 'http://reddit.com' + post.data.permalink,
      windowName: '_system' // abre la ventana del navegador del sistema
    })

  };
  openSettings(): void {
    this.modalController.create({
      component: SettingsPage
    }).then( modal => {
      modal.onDidDismiss().then(
        () => this.redditService.resetPosts());
      modal.present();
      }
    );
  }

  playVideo(e, post): void {
    console.log(e);
    // crear una referencia al video
    const video = e.target;
    // conmuta entre reproducir y parar el video

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };
  loadMore(): void {
    this.redditService.nextPage();
  };
}
