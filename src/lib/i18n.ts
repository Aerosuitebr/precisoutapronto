export const locales = ['pt-BR', 'en', 'es'] as const;
export type Locale = (typeof locales)[number];
export type InternationalLocale = Exclude<Locale, 'pt-BR'>;

export function isInternationalLocale(value: string): value is InternationalLocale {
  return value === 'en' || value === 'es';
}

export const localePath: Record<Locale, string> = {
  'pt-BR': '/',
  en: '/en',
  es: '/es'
};

export const localeLabel: Record<Locale, string> = {
  'pt-BR': 'Português',
  en: 'English',
  es: 'Español'
};

export const internationalCopy = {
  en: {
    metadata: {
      title: 'Resolva Jato | Professional documents and Pix payments',
      description:
        'Create quotes, collect Pix payments on WhatsApp and generate professional PDFs in minutes.'
    },
    navigation: {
      tools: 'Tools',
      howItWorks: 'How it works',
      testimonials: 'Testimonials',
      signIn: 'Sign in',
      createAccount: 'Create free account',
      language: 'Language'
    },
    auth: {
      login: {
        metadataTitle: 'Sign in',
        subtitle: 'Sign in to use résumés, receipts, proposals and your work tools.',
        intro: 'Access your tools and create professional documents.',
        password: 'Password',
        submit: 'Sign in',
        loading: 'Signing in...',
        noAccount: 'Don’t have an account yet?',
        createAccount: 'Create a free account',
        error: 'We couldn’t sign you in. Check your email and password.',
        verify: 'Your account exists, but your email still needs to be verified.',
        resend: 'Resend verification email',
        resendSuccess: 'If the account exists and is not verified, we sent a new email.'
      },
      register: {
        metadataTitle: 'Create free account',
        subtitle: 'Create your free account, confirm your email and unlock the tools.',
        intro: 'No credit card. Confirm your email to unlock the tools.',
        name: 'Your name',
        password: 'Password',
        passwordPlaceholder: 'Create a strong password',
        passwordHelp: 'Use at least 8 characters with uppercase, lowercase, a number and a symbol.',
        submit: 'Create account',
        loading: 'Creating account...',
        hasAccount: 'Already have an account?',
        signIn: 'Sign in',
        error: 'We couldn’t create your account. Please review the information and try again.',
        confirmTitle: 'Confirm your email',
        confirmText: 'We sent a confirmation link to',
        confirmHelp: 'Check your inbox and spam folder before requesting another message.',
        goToLogin: 'Go to sign in'
      },
      email: 'Email address',
      privacy: 'Protected access. Your password is never displayed or shared.',
      backHome: 'Back to the Resolva Jato home page'
    },
    hero: {
      eyebrow: 'The digital office that gets things done',
      title: 'Quotes, Pix payments and professional PDFs. Ready in minutes.',
      description:
        'Send a quote, let your client approve it on their phone and collect with Pix on WhatsApp. Create receipts, proposals, contracts and résumés in the same place.',
      primaryCta: 'Create a free quote',
      secondaryCta: 'Explore all tools',
      checks: [
        'Client approval on mobile, with no app to install',
        'Pix QR code and copy-and-paste payment code',
        'Professional PDF, ready to send'
      ]
    },
    workflow: {
      eyebrow: 'From quote to payment',
      title: 'Less back-and-forth. More work approved.',
      description:
        'A simple flow built for independent professionals and small businesses that already work through WhatsApp.',
      steps: [
        ['1', 'Create the quote', 'Add the client, services and price in a guided form.'],
        ['2', 'Send it on WhatsApp', 'Your client opens a clean approval page on their phone.'],
        ['3', 'Get paid with Pix', 'Generate the QR code and payment message without retyping data.']
      ]
    },
    tools: {
      eyebrow: 'Everything in one place',
      title: 'Documents that look professional.',
      items: [
        ['Quote + Pix', 'Approval and payment in the same mobile flow.'],
        ['Receipt', 'Amount in words and a PDF ready for signature.'],
        ['Business proposal', 'Agency-style presentation with clear totals.'],
        ['Résumé', 'Professional layouts and instant PDF export.'],
        ['Contract', 'Editable templates for everyday service work.'],
        ['Free resources', 'A curated collection for work and study.']
      ],
      cta: 'Open tools'
    },
    socialProof: {
      eyebrow: 'What the community says',
      title: 'Built for the way professionals actually work.',
      source: 'Public comment about Resolva Jato',
      translated: 'Translated from Portuguese',
      caleb:
        'I loved how you made Pix on WhatsApp the starting point — very practical for the MEI audience. The focused tool selection is also spot on.',
      sharmistha:
        'Finally something built for the MEI crowd that actually gets WhatsApp. The Pix budget generator saved me from chasing clients at 11pm.'
    },
    finalCta: {
      title: 'Ready to make your next job look more professional?',
      description: 'Start free. Create the document, send it and move on with your day.',
      button: 'Start with Resolva Jato'
    },
    footer: 'Professional documents and practical tools for everyday work.'
  },
  es: {
    metadata: {
      title: 'Resolva Jato | Documentos profesionales y cobros con Pix',
      description:
        'Crea presupuestos, cobra con Pix por WhatsApp y genera documentos profesionales en PDF en minutos.'
    },
    navigation: {
      tools: 'Herramientas',
      howItWorks: 'Cómo funciona',
      testimonials: 'Testimonios',
      signIn: 'Ingresar',
      createAccount: 'Crear cuenta gratis',
      language: 'Idioma'
    },
    auth: {
      login: {
        metadataTitle: 'Ingresar',
        subtitle: 'Ingresa para usar currículums, recibos, propuestas y tus herramientas de trabajo.',
        intro: 'Accede a tus herramientas y crea documentos profesionales.',
        password: 'Contraseña',
        submit: 'Ingresar',
        loading: 'Ingresando...',
        noAccount: '¿Todavía no tienes una cuenta?',
        createAccount: 'Crear cuenta gratis',
        error: 'No pudimos iniciar sesión. Revisa tu correo y contraseña.',
        verify: 'La cuenta existe, pero todavía debes confirmar tu correo.',
        resend: 'Reenviar correo de confirmación',
        resendSuccess: 'Si la cuenta existe y aún no está confirmada, enviamos un nuevo correo.'
      },
      register: {
        metadataTitle: 'Crear cuenta gratis',
        subtitle: 'Crea tu cuenta gratis, confirma tu correo y habilita las herramientas.',
        intro: 'Sin tarjeta. Confirma tu correo para habilitar las herramientas.',
        name: 'Tu nombre',
        password: 'Contraseña',
        passwordPlaceholder: 'Crea una contraseña segura',
        passwordHelp: 'Usa al menos 8 caracteres con mayúscula, minúscula, número y símbolo.',
        submit: 'Crear cuenta',
        loading: 'Creando cuenta...',
        hasAccount: '¿Ya tienes una cuenta?',
        signIn: 'Ingresar',
        error: 'No pudimos crear tu cuenta. Revisa los datos e inténtalo de nuevo.',
        confirmTitle: 'Confirma tu correo',
        confirmText: 'Enviamos un enlace de confirmación a',
        confirmHelp: 'Revisa tu bandeja de entrada y spam antes de solicitar otro mensaje.',
        goToLogin: 'Ir al ingreso'
      },
      email: 'Correo electrónico',
      privacy: 'Acceso protegido. Tu contraseña nunca se muestra ni se comparte.',
      backHome: 'Volver a la página inicial de Resolva Jato'
    },
    hero: {
      eyebrow: 'La oficina digital que resuelve',
      title: 'Presupuestos, cobros con Pix y PDF profesionales. Listos en minutos.',
      description:
        'Envía un presupuesto, recibe la aprobación del cliente en su celular y cobra con Pix por WhatsApp. Crea recibos, propuestas, contratos y currículums en un solo lugar.',
      primaryCta: 'Crear presupuesto gratis',
      secondaryCta: 'Explorar herramientas',
      checks: [
        'Aprobación del cliente desde el celular, sin instalar aplicaciones',
        'Código QR de Pix y código para copiar y pegar',
        'PDF profesional listo para enviar'
      ]
    },
    workflow: {
      eyebrow: 'Del presupuesto al cobro',
      title: 'Menos mensajes. Más trabajos aprobados.',
      description:
        'Un flujo sencillo para profesionales independientes y pequeños negocios que ya trabajan por WhatsApp.',
      steps: [
        ['1', 'Crea el presupuesto', 'Agrega el cliente, los servicios y el valor en un formulario guiado.'],
        ['2', 'Envíalo por WhatsApp', 'El cliente abre una página clara y aprueba desde su celular.'],
        ['3', 'Cobra con Pix', 'Genera el QR y el mensaje de cobro sin volver a escribir los datos.']
      ]
    },
    tools: {
      eyebrow: 'Todo en un solo lugar',
      title: 'Documentos con imagen profesional.',
      items: [
        ['Presupuesto + Pix', 'Aprobación y cobro en el mismo flujo móvil.'],
        ['Recibo', 'Valor por escrito y PDF listo para firmar.'],
        ['Propuesta comercial', 'Presentación con estilo de agencia y totales claros.'],
        ['Currículum', 'Diseños profesionales y exportación inmediata a PDF.'],
        ['Contrato', 'Modelos editables para servicios cotidianos.'],
        ['Recursos gratuitos', 'Una selección útil para trabajar y estudiar.']
      ],
      cta: 'Abrir herramientas'
    },
    socialProof: {
      eyebrow: 'Lo que dice la comunidad',
      title: 'Creado para la forma real de trabajar.',
      source: 'Comentario público sobre Resolva Jato',
      translated: 'Traducido al español',
      caleb:
        'Me encantó que pusieran Pix en WhatsApp como punto de partida: es muy práctico para el público MEI. La selección de herramientas también está muy bien enfocada.',
      sharmistha:
        'Por fin algo creado para el público MEI que realmente entiende WhatsApp. El generador de presupuestos con Pix evitó que tuviera que perseguir clientes a las 11 de la noche.'
    },
    finalCta: {
      title: '¿Listo para presentar tu próximo trabajo de forma profesional?',
      description: 'Comienza gratis. Crea el documento, envíalo y continúa con tu día.',
      button: 'Comenzar con Resolva Jato'
    },
    footer: 'Documentos profesionales y herramientas prácticas para el trabajo diario.'
  }
} as const;
