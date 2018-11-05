import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { load } from '@angular/core/src/render3/instructions';

@Injectable({
  providedIn: 'root'
})
export class RedditService {
  public settings = {
    perPage: 10,
    subreddit: 'gifs',
    sort: '/hot'
  }
  public posts: any[] = [];
  public loading = false;
  private page = 1;
  private after: string;
  private moreCount = 0;

  constructor(
    private httpClient: HttpClient,
    private dataService: DataService
  ) { }

  load(): void {
    this.dataService.getData().then(data => {
      if (data != null) {
        this.settings = data;
      }
      this.fetchData();
    })

  }

  fetchData(): void {
    let url = 'https:/www.reddit.com/r/' +
      this.settings.subreddit +
      this.settings.sort + '/.json?limit=100';
    if (this.after) {
      url += '&after=' + this.after;
    }
    this.loading = true;
    this.httpClient.get(url).pipe(
      map((res: any) => {
        console.log(res);
        let response = res.data.children;
        let validPosts = 0;
        // nos quita los post que no tienen videos
        response = response.filter(
          post => {
            //si ya hemos sacado suficientes post paramos
            if (validPosts >= this.settings.perPage) {
              return false;
            }
            //solo nos interesan los ficheros .gifv y .webm para convertir a mp4
            if ((post.data.url.indexOf('.gifv') > -1) ||
              (post.data.url.indexOf('.webm') > -1)) {
              post.data.url = post.data.url.replace('.gifv', '.mp4');
              post.data.url = post.data.url.replace('.webm', '.mp4');

              // si hay una preview del video disponible,
              // se asigna al post como 'snapshot'

              if (typeof (post.data.preview) !== 'undefined') {
                post.data.snapshot =
                  post.data.preview.images[0].source.url.replace(/&amp;/g, '&')
                // Si el snapshot no está definido se pone vacio
                // para que no salgo el icono de imagen rota
                if (post.data.snapshot === 'undefined') {
                  post.data.snapshot = '';
                }
              } else {
                post.data.snapshot = '';
              }
              validPosts++;
              return true;
            } else {
              return false;
            }
          }
        );
        // si tenemos suficientes post validos , se ponen 
        // como el after, si no , se pone el ultimo post
        if (validPosts >= this.settings.perPage) {
          this.after = response[this.settings.perPage - 1].data.name;
        } else if (res.data.children.length > 0) {
          this.after = res.data.children[res.data.children.length - 1].data.name;
          console.log(this.after);
        }
        return response;
      })
    ).subscribe(
      data => {
        console.log(data);
        // se añaden los post que acabamos de coger a los post existentes
        this.posts.push(...data);

        // seguimos buscando más gifs mientras no recarguemos la página
        // Después de 20 intentos desistimos aunque no tengamos suficientes

        if (this.moreCount > 20) {
          console.log('Desistiendo...');
          this.moreCount = 0;
          this.loading = false;
        } else {
          // si no tenemos suficientes post para rellenar una pagina
          // intentamos coger más datos
          if (this.posts.length < (this.settings.perPage * this.page)) {
            this.fetchData();
            this.moreCount++;
          } else {
            this.loading = false;
            this.moreCount = 0;
          }
        }


      }, (error) => {
        console.log(error);
        console.log('No se encuentran los datos...');
      }
    );
  }
  nextPage(): void {
    this.page++;
    this.fetchData();
  }

  resetPosts(): void {
    this.page = 1;
    this.posts = [];
    this.after = null;
    this.fetchData();
  }

  changeSubreddit(subreddit: string): void {
    this.settings.subreddit = subreddit;
    this.resetPosts();
  }
}
