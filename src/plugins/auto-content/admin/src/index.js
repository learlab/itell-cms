import pluginPkg from "../../package.json";
import pluginId from "./pluginId";
import Initializer from "./components/Initializer";
import PluginIcon from "./components/PluginIcon";
import ContentGeneratorIcon from "./components/ContentGenerator/ContentGeneratorIcon";
import QuestionIcon from "./components/QuestionField/QuestionIcon";
import ConstructedResponseIcon from "./components/ConstructedResponseField/ConstructedResponseIcon";
import KeyPhraseGeneratorIcon from "./components/KeyPhraseGenerator/KeyPhraseGeneratorIcon";
import SlugFieldIcon from "./components/SlugField/SlugFieldIcon";

const name = pluginPkg.strapi.name;

export default {
  register(app) {
    app.addMenuLink({
      to: `/plugins/${pluginId}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: name,
      },
      Component: async () => {
        const component = await import(
          /* webpackChunkName: "[request]" */ "./pages/App"
        );

        return component;
      },
      permissions: [
        // Uncomment to set the permissions of the plugin here
        // {
        //   action: '', // the action name should be plugin::plugin-name.actionType
        //   subject: null,
        // },
      ],
    });
    app.registerPlugin({
      id: pluginId,
      initializer: Initializer,
      isReady: false,
      name,
    });
    app.customFields.register([
      {
        name: "question",
        pluginId: "auto-content",
        type: "text",
        intlLabel: {
          id: "auto-content.auto-content.label",
          defaultMessage: "Full answer ",
        },
        intlDescription: {
          id: "auto-content.auto-content.description",
          defaultMessage: "Disabled field that will show ai-generated QA",
        },
        icon: ContentGeneratorIcon,
        components: {
          Input: async () =>
            import("./components/ContentGenerator/ContentGeneratorInput"),
        },
        options: {
          base: [],
          advanced: [],
        },
      },
      {
        name: "constructedResponse",
        pluginId: "auto-content",
        type: "text",
        intlLabel: {
          id: "constructedResponse.constructedResponse.label",
          defaultMessage: "Constructed Response",
        },
        intlDescription: {
          id: "constructedResponse.constructedResponse.description",
          defaultMessage:
            "Field to generate or input answers to comprehension question",
        },
        icon: ConstructedResponseIcon,
        components: {
          Input: async () =>
            import(
              "./components/ConstructedResponseField/ConstructedResponseInput"
            ),
        },
        options: {
          base: [],
          advanced: [],
        },
      },
      {
        name: "generatedQuestion",
        pluginId: "auto-content",
        type: "text",
        intlLabel: {
          id: "generatedQuestion.generatedQuestion.label",
          defaultMessage: "Question Content",
        },
        intlDescription: {
          id: "generatedQuestion.generatedQuestion.description",
          defaultMessage: "Field to generate or input comprehension question",
        },
        icon: QuestionIcon,
        components: {
          Input: async () => import("./components/QuestionField/QuestionInput"),
        },
        options: {
          base: [],
          advanced: [],
        },
      },
      {
        name: "slug",
        pluginId: "auto-content",
        type: "text",
        intlLabel: {
          id: "slug.slug.label",
          defaultMessage: "Slug",
        },
        intlDescription: {
          id: "slug.slug.description",
          defaultMessage: "Field where slug will be generated",
        },
        icon: SlugFieldIcon,
        components: {
          Input: async () => import("./components/SlugField/SlugFieldInput"),
        },
        options: {
          base: [],
          advanced: [],
        },
      },
      {
        name: "keyPhrase",
        pluginId: "auto-content",
        type: "text",
        intlLabel: {
          id: "keyPhrase.keyPhrase.label",
          defaultMessage: "Key Phrases",
        },
        intlDescription: {
          id: "keyPhrase.keyPhrase.description",
          defaultMessage: "Generate key phrases using AI",
        },
        icon: KeyPhraseGeneratorIcon,
        components: {
          Input: async () =>
            import("./components/KeyPhraseGenerator/KeyPhraseGeneratorInput"),
        },
        options: {
          base: [],
          advanced: [],
        },
      },
    ]);
  },

  bootstrap(app) {},
  async registerTrads({ locales }) {
    const importedTrads = await Promise.all(
      locales.map((locale) => {
        return import(
          /* webpackChunkName: "translation-[request]" */ `./translations/${locale}.json`
        )
          .then(({ default: data }) => {
            return {
              data: `${pluginId}.${id}`,
              locale,
            };
          })
          .catch(() => {
            return {
              data: {},
              locale,
            };
          });
      }),
    );

    return Promise.resolve(importedTrads);
  },
};
