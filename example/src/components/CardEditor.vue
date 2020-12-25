<template>
  <div class="editor-wrapper u-scroller">
    <div class="editor">
      <p class="form__top-label">Front</p>
      <quill-editor
        class="flashcard__content m-2"
        ref="myQuillEditorFront"
        v-model="newFrontText"
        :options="editorOptions"
      ></quill-editor>
      <!-- <input v-model="newFrontText" name="card-front-input" class="form__text-input" type="text" /> -->
      <p class="form__top-label">Back</p>
      <!-- <input v-model="newBackText" name="card-back-input" class="form__text-input" type="text" /> -->
      <quill-editor
        class="flashcard__content m-2"
        ref="myQuillEditorBack"
        v-model="newBackText"
        :options="editorOptions"
      ></quill-editor>
      <div class="form__button-row ">
        <font-awesome-icon
          class="form__button button form__button--cancel"
          icon="times"
          size="2x"
          @click="$emit('closeEditor')"
        ></font-awesome-icon>
        <font-awesome-icon
          class="form__button button form__button--confirm primary"
          icon="check"
          size="2x"
          @click="newCard ? addCard() : editCard()"
        ></font-awesome-icon>
      </div>
      <div v-if="newCard">
        <div class="form__top-label">
          Add card to deck:
          <strong class="form__top-label--strong">{{ selectedDeck.title }}</strong>
        </div>
        <span v-show="decks.length > 1" class="tag-selection">
          <span class="tag-selection__title">Change deck:</span>
          <span v-for="deck in decks" :key="deck._id" class="tag-selection__tag-span">
            <button
              v-show="deck._id !== selectedDeck._id && !deck.deleted"
              class="tag-selection__tag"
              @click="$emit('changeSelectedDeck', deck._id)"
            >
              {{ deck.title }}
            </button>
          </span>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { v4 as uuid } from 'uuid';
import { Quill, quillEditor } from 'vue-quill-editor';
import 'quill/dist/quill.snow.css';
import imageUpload from 'quill-plugin-image-upload';
import { uploadPictureToBucket } from '../store/textileHelpers';

Quill.register('modules/imageUpload', imageUpload);
const toolbarContent = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'link', 'code-block', 'image'],
  ['clean'],
];

import store from '../store';
export default {
  components: { quillEditor },
  props: {
    editPayload: {
      type: Object,
      default: function() {
        return {
          deckId: {
            type: String,
            default: '',
          },
          frontText: {
            type: String,
            default: '',
          },
          backText: {
            type: String,
            default: '',
          },
          _id: {
            type: String,
            default: '',
          },
        };
      },
    },
    selectedDeck: {
      type: Object,
      default() {
        return {
          cards: [],
          title: 'none selected',
          _id: '',
          deleted: false,
          ttl: 1596161096048,
        };
      },
    },
    decks: {
      type: Array,
      default() {
        return [];
      },
    },
    newCard: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      newFrontText: '',
      newBackText: '',
      editorOptions: {
        theme: 'snow',
        modules: {
          imageUpload: {
            upload: async file => {
              return await uploadPictureToBucket(file);
            },
          },
          toolbar: toolbarContent,
          history: {
            delay: 2000,
            maxStack: 500,
            userOnly: true,
          },
        },
      },
    };
  },
  created() {
    this.setFields();
  },

  methods: {
    setFields: function() {
      if (!this.newCard) {
        this.newFrontText = JSON.parse(JSON.stringify(this.editPayload.frontText));
        this.newBackText = JSON.parse(JSON.stringify(this.editPayload.backText));
      }
    },
    addCard: function() {
      const payload = {
        card: {
          frontText: this.newFrontText,
          backText: this.newBackText,
          _id: uuid(),
          updatedAt: new Date().getTime(),
        },
        deckId: this.selectedDeck._id,
      };
      this.$emit('addCard', payload);
    },
    editCard: function() {
      const payload = {
        card: {
          frontText: this.newFrontText,
          backText: this.newBackText,
          _id: this.editPayload._id,
          updatedAt: new Date().getTime(),
        },
        deckId: this.editPayload.deckId,
      };
      this.$emit('editCard', payload);
    },
  },
};
</script>

<style scoped>
.editor-wrapper {
  z-index: 5000;
  overflow: scroll;
  position: fixed;
  top: 100px;
  padding: 20px;
  height: calc(100% - 150px);
  left: 0;
  display: flex;
  width: 100%;
  justify-content: center;
}

.editor {
  background-color: white;
  box-shadow: 0px 0px 14px 1px #0000008c;
  text-align: center;
  border-radius: 1px;
  overflow: scroll;
}
.tag-selection__tag {
  color: white;
  background: grey;
  border: none;
  border-radius: 7px;
  margin: 5px;
  padding: 0.35rem;
  cursor: pointer;
  font-weight: bold;
}
.flashcard__content >>> img {
  width: 100%;
  margin: auto;
  object-fit: fill;
}
.flashcard__content >>> .ql-align-center {
  text-align: center;
}
.flashcard__content >>> .ql-align-right {
  text-align: right;
}
.flashcard__content >>> .ql-align-left {
  text-align: left;
}
.flashcard__content >>> .ql-align-justify {
  text-align: justify;
}
.flashcard__content >>> p {
  font-size: 1em;
}
.flashcard__content >>> h3 {
  font-size: 1.5em;
}
.flashcard__content >>> h2 {
  font-size: 2em;
}
.flashcard__content >>> h1 {
  font-size: 3.5em;
}
.flashcard__content >>> em {
  font-style: italic;
}
</style>
