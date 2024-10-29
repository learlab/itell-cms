import type { Struct, Schema } from '@strapi/strapi';

export interface QuizzesMultipleChoiceQuestion extends Struct.ComponentSchema {
  collectionName: 'components_quizzes_multiple_choice_questions';
  info: {
    displayName: 'MultipleChoiceQuestion';
    icon: 'bulletList';
    description: '';
  };
  attributes: {
    Question: Schema.Attribute.Text & Schema.Attribute.Required;
    Answers: Schema.Attribute.Component<'quizzes.multiple-choice-option', true>;
  };
}

export interface QuizzesMultipleChoiceOption extends Struct.ComponentSchema {
  collectionName: 'components_quizzes_multiple_choice_options';
  info: {
    displayName: 'MultipleChoiceOption';
    icon: 'bulletList';
    description: '';
  };
  attributes: {
    Text: Schema.Attribute.Text & Schema.Attribute.Required;
    IsCorrect: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
  };
}

export interface PageVideo extends Struct.ComponentSchema {
  collectionName: 'components_page_videos';
  info: {
    displayName: 'Video';
    description: '';
  };
  attributes: {
    Header: Schema.Attribute.String & Schema.Attribute.Required;
    URL: Schema.Attribute.String & Schema.Attribute.Required;
    StartTime: Schema.Attribute.Integer;
    EndTime: Schema.Attribute.Integer;
    Description: Schema.Attribute.Text;
    CleanText: Schema.Attribute.Text;
    MDX: Schema.Attribute.Text;
    QuestionAnswerResponse: Schema.Attribute.Text &
      Schema.Attribute.CustomField<'plugin::auto-content.question'>;
    KeyPhrase: Schema.Attribute.Text &
      Schema.Attribute.CustomField<'plugin::auto-content.keyPhrase'>;
    Question: Schema.Attribute.Text &
      Schema.Attribute.CustomField<'plugin::auto-content.generatedQuestion'>;
    ConstructedResponse: Schema.Attribute.Text &
      Schema.Attribute.CustomField<'plugin::auto-content.constructedResponse'>;
    Slug: Schema.Attribute.Text &
      Schema.Attribute.CustomField<'plugin::auto-content.slug'>;
  };
}

export interface PagePlainChunk extends Struct.ComponentSchema {
  collectionName: 'components_page_plain_chunks';
  info: {
    displayName: 'Plain-Chunk';
    icon: 'dashboard';
    description: '';
  };
  attributes: {
    CleanText: Schema.Attribute.Text & Schema.Attribute.DefaultTo<'not set'>;
    MDX: Schema.Attribute.Text & Schema.Attribute.DefaultTo<'not set'>;
    Text: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        'plugin::ckeditor.CKEditor',
        {
          output: 'HTML';
          preset: 'standard';
        }
      >;
    Slug: Schema.Attribute.Text &
      Schema.Attribute.CustomField<'plugin::auto-content.slug'>;
    Header: Schema.Attribute.String & Schema.Attribute.Required;
    ShowHeader: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
    HeaderLevel: Schema.Attribute.Enumeration<['H2', 'H3', 'H4']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'H2'>;
    MD: Schema.Attribute.Text;
  };
}

export interface PageChunk extends Struct.ComponentSchema {
  collectionName: 'components_page_chunks';
  info: {
    displayName: 'Chunk';
    description: '';
  };
  attributes: {
    QuestionAnswerResponse: Schema.Attribute.Text &
      Schema.Attribute.CustomField<'plugin::auto-content.question'>;
    CleanText: Schema.Attribute.Text & Schema.Attribute.DefaultTo<'not set'>;
    MDX: Schema.Attribute.Text & Schema.Attribute.DefaultTo<'not set'>;
    KeyPhrase: Schema.Attribute.Text &
      Schema.Attribute.CustomField<'plugin::auto-content.keyPhrase'>;
    ConstructedResponse: Schema.Attribute.Text &
      Schema.Attribute.CustomField<'plugin::auto-content.constructedResponse'>;
    Question: Schema.Attribute.Text &
      Schema.Attribute.CustomField<'plugin::auto-content.generatedQuestion'>;
    Text: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        'plugin::ckeditor.CKEditor',
        {
          output: 'HTML';
          preset: 'standard';
        }
      >;
    Slug: Schema.Attribute.Text &
      Schema.Attribute.CustomField<'plugin::auto-content.slug'>;
    Header: Schema.Attribute.String & Schema.Attribute.Required;
    ShowHeader: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
    HeaderLevel: Schema.Attribute.Enumeration<['H2', 'H3', 'H4']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'H2'>;
    MD: Schema.Attribute.Text;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'quizzes.multiple-choice-question': QuizzesMultipleChoiceQuestion;
      'quizzes.multiple-choice-option': QuizzesMultipleChoiceOption;
      'page.video': PageVideo;
      'page.plain-chunk': PagePlainChunk;
      'page.chunk': PageChunk;
    }
  }
}
