import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ArticleMetadata, ArticlesData } from 'src/app/interfaces/interface';
import { HttpClientService } from 'src/app/services/server-communication/http-client/http-client.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-article-manager',
  templateUrl: './article-manager.component.html',
  styleUrls: ['./article-manager.component.css'],
})
export class ArticleManagerComponent implements OnInit {
  constructor(
    private httpClient: HttpClientService,
    private snackbar: SnackbarService
  ) {}

  @ViewChild('articleFileInput') articleFileInput: ElementRef;
  @ViewChild('imageInput') imageInput: ElementRef;
  @ViewChild('headerImageInput') headerImageInput: ElementRef;

  imageForm: FormGroup = new FormGroup({
    image: new FormControl('', [Validators.required]),
  });

  articleForm: FormGroup = new FormGroup({
    article: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required]),
    author: new FormControl('', [Validators.required]),
    summary: new FormControl('', [Validators.required]),
    tag: new FormControl('', [Validators.required]),
    imageCreditAuthor: new FormControl('', [Validators.required]),
    imageCreditLink: new FormControl('', [Validators.required]),
    image: new FormControl('', [Validators.required]),
  });

  metadatas: ArticleMetadata[] = [];

  ngOnInit(): void {
    this.fetchArticlesMetadata();
  }

  fetchArticlesMetadata() {
    this.httpClient.get('/articles').subscribe((data: ArticlesData) => {
      this.metadatas = data.metadatas;
    });
  }

  onSubmitImage() {
    const imageFileList: FileList = this.imageInput.nativeElement.files;
    const imageFile: File = imageFileList[0];

    this.toBase64(imageFile, (base64) => {
      this.httpClient.post('/articles/images', { base64 }).subscribe(
        () => {
          this.snackbar.openSnackBar('Image submitted.');
          this.fetchArticlesMetadata();
          this.articleForm.reset();
        },
        (err) => {
          console.log(err);
        }
      );
    });
  }

  onSubmitArticle() {
    const value = this.articleForm.value;

    const imageFileList: FileList = this.headerImageInput.nativeElement.files;
    const imageFile: File = imageFileList[0];

    const articleFileList: FileList = this.articleFileInput.nativeElement.files;
    const articleFile: File = articleFileList[0];

    this.toBase64(imageFile, (base64) => {
      this.httpClient
        .uploadFile('/articles/content', 'article', articleFile, false)
        .subscribe(
          (createdMetadata: ArticleMetadata) => {
            const id = createdMetadata.id;
            const dataToAdd = {
              name: value.name,
              author: value.author,
              summary: value.summary,
              tag: value.tag,
              imageCreditAuthor: value.imageCreditAuthor,
              imageCreditLink: value.imageCreditLink,
            };
            this.httpClient
              .patch('/articles/id/' + id + '/metadata', dataToAdd)
              .subscribe(
                () => {
                  this.httpClient
                    .patch('/articles/id/' + id + '/image', { base64 })
                    .subscribe(
                      async () => {
                        this.snackbar.openSnackBar('Article submitted.');
                        this.fetchArticlesMetadata();
                        this.articleForm.reset();
                        await this.httpClient.sendNotifToEveryone(
                          'A new article has been published! You can check it out in the article section.'
                        ).subscribe();
                      },
                      (err) => {
                        console.log(err);
                      }
                    );
                },
                (err) => {
                  console.log(err);
                }
              );
          },
          (err) => {}
        );
    });
  }

  toBase64(imageFile: File, callback: (result: any) => void) {
    var reader = new FileReader();
    reader.onloadend = function () {
      callback(reader.result);
    };
    reader.readAsDataURL(imageFile);
  }

  deleteArticle(id: string, fileName: string) {
    const isConfirmed = window.confirm('Delete ' + fileName + ' ?');
    if (isConfirmed) {
      this.httpClient.delete('/articles/id/' + id).subscribe(
        () => {
          this.snackbar.openSnackBar('Article deleted.');
          this.fetchArticlesMetadata();
        },
        (err: number) => {}
      );
    }
  }

  dropMetadata(event: CdkDragDrop<string[]>) {
    //moveItemInArray(this.movies, event.previousIndex, event.currentIndex);

    const id1 = this.metadatas[event.previousIndex].id;
    const id2 = this.metadatas[event.currentIndex].id;

    this.httpClient
      .post('/articles/swap/id1/' + id1 + '/id2/' + id2, {})
      .subscribe(
        () => {
          this.fetchArticlesMetadata();
        },
        (err: number) => {}
      );
    this.swapMetadatasLocally(event.previousIndex, event.currentIndex);
  }

  swapMetadatasLocally(index1: number, index2: number) {
    const metadataCopy = this.metadatas[index1];
    this.metadatas[index1] = this.metadatas[index2];
    this.metadatas[index2] = metadataCopy;
  }

  get articleFile() {
    if (this.articleFileInput) {
      const file = this.articleFileInput.nativeElement.files[0];
      if (file) {
        return file.name;
      }
    }
    return '';
  }

  get headerImageFile() {
    if (this.headerImageInput) {
      const file = this.headerImageInput.nativeElement.files[0];
      if (file) {
        return file.name;
      }
    }
    return '';
  }

  get imageFile() {
    if (this.imageInput) {
      const file = this.imageInput.nativeElement.files[0];
      if (file) {
        return file.name;
      }
    }
    return '';
  }
}
