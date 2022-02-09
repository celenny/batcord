import { Box, Text, TextField, Image, Button } from '@skynexui/components';
import React from 'react';
import appConfig from '../config.json';
import { useRouter } from 'next/router';
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { ButtonSendSticker } from '../src/components/ButtonSendSticker';

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzYzNTE0NSwiZXhwIjoxOTU5MjExMTQ1fQ.KELSnwkNdkvtICREJGoALGJTlBLIezokAOExjEiC40s';
const SUPABASE_URL = 'https://jdbckqvhdsdvvuwfuilk.supabase.co';

// Create a single supabase client for interacting with your database
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function escutaMensagensEmTempoReal(adicionaMensagem) {
  return supabaseClient
    .from('mensagens')
    .on('INSERT', (respostaLive) => {
      adicionaMensagem(respostaLive.new);
    })
    .subscribe();
}

export default function ChatPage() {
  const roteamento = useRouter();
  const usuarioLogado = roteamento.query.username;
  const [mensagem, setMensagem] = React.useState('');
  const [listaDeMensagens, setListaDeMensagens] = React.useState([]);

  React.useEffect(() => {
    supabaseClient
      .from('mensagens')
      .select('*')
      .order('id', { ascending: false })
      .then(({ data }) => {
        console.log('Dados da consulta:', data);
        setListaDeMensagens(data);
      });

    escutaMensagensEmTempoReal((novaMensagem) => {
      setListaDeMensagens((valorAtualDaLista) => {
        return [
          novaMensagem,
          ...valorAtualDaLista,
        ]
      });
    });
  }, []);

  function handleNovaMensagem(novaMensagem) {
    const mensagem = {
      //id: listaDeMensagens.length + 1,
      de: usuarioLogado,
      texto: novaMensagem,
    };

    supabaseClient
      .from('mensagens')
      .insert([
        //tem que ser um objetoc com os mesmos campos do supabase
        mensagem
      ])
      .then(({ data }) => {
        console.log('criando mensagem: ', data);
      });

    setMensagem('');

    /*if (novaMensagem) {
      setListaDeMensagens([
        mensagem,
        ...listaDeMensagens,
      ]);
      setMensagem('');
    }*/
  }

  function handleRemoverMensagem(mensagemId) {
    const mensagens = listaDeMensagens.filter((valor) => valor.id !== mensagemId);
    setListaDeMensagens(mensagens);
  }

  return (
    <Box
      styleSheet={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: appConfig.theme.colors.primary[500],
        backgroundImage: `url(https://i.pinimg.com/originals/b8/39/cb/b839cb63e04ed9052a68aa2139f26385.jpg)`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundBlendMode: 'multiply',
        color: appConfig.theme.colors.neutrals['000']
      }}
    >
      <Box
        styleSheet={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          boxShadow: '0 2px 10px 0 rgb(0 0 0 / 20%)',
          borderRadius: '5px',
          backgroundColor: appConfig.theme.colors.neutrals[700],
          height: '100%',
          maxWidth: '95%',
          maxHeight: '95vh',
          padding: '32px',
        }}
      >
        <Header />
        <Box
          styleSheet={{
            position: 'relative',
            display: 'flex',
            flex: 1,
            height: '80%',
            backgroundColor: appConfig.theme.colors.neutrals[600],
            flexDirection: 'column',
            borderRadius: '5px',
            padding: '16px',
          }}
        >

          <MessageList mensagens={listaDeMensagens} handleRemoverMensagem={handleRemoverMensagem} />
          {/*{listaDeMensagens.map((mensagemAtual) => {
              return (
                <li key={mensagemAtual.id}>
                  {mensagemAtual.de}: {mensagemAtual.texto}
                </li>
              )
          })}*/}
          <Box
            as="form"
            styleSheet={{
              display: 'flex',
              flexDirection: 'row',
            }}
          >
            <TextField
              value={mensagem}
              onChange={(event) => {
                const valor = event.target.value;
                setMensagem(valor);
              }}
              onKeyPress={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleNovaMensagem(mensagem);
                }
              }}
              placeholder="Insira sua mensagem aqui..."
              type="textarea"
              styleSheet={{
                width: '100%',
                border: '0',
                resize: 'none',
                borderRadius: '5px',
                padding: '6px 8px',
                backgroundColor: appConfig.theme.colors.neutrals[800],
                marginRight: '12px',
                color: appConfig.theme.colors.neutrals[200],
              }}
            />
            <Button
              iconName='paperPlane'
              type='submit'
              onClick={(event) => {
                event.preventDefault();
                handleNovaMensagem(mensagem)
              }}
              style={{
                borderRadius: '0%',
                height: 44,
                borderRadius: '5px',
                padding: '6px 8px',
                fontSize: '16px',
              }}
              styleSheet={{
                backgroundColor: appConfig.theme.colors.neutrals[800],
                marginRight: '12px',
                hover: {
                  backgroundColor: appConfig.theme.colors.primary[700]
                },
                focus: {
                  backgroundColor: appConfig.theme.colors.primary[700]
                }
              }}
            />
            <ButtonSendSticker onStickerClick={(sticker) => {
              // console.log('[USANDO O COMPONENTE] Salva esse sticker no banco', sticker);
              handleNovaMensagem(`:sticker: ${sticker}`);
            }} />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

function Header() {
  return (
    <>
      <Box styleSheet={{ width: '100%', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
        <Text variant='heading5'>
          Chat
        </Text>
        <Button
          variant='tertiary'
          colorVariant='neutral'
          label='Logout'
          href="/"
        />
      </Box>
    </>
  )
}

function MessageList(props) {
  return (
    <Box
      tag="ul"
      styleSheet={{
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column-reverse',
        flex: 1,
        color: appConfig.theme.colors.neutrals["000"],
        marginBottom: '16px',
      }}
    >
      {props.mensagens.map((mensagem) => {
        return (
          <Text
            key={mensagem.id}
            tag="li"
            styleSheet={{
              borderRadius: '5px',
              padding: '6px',
              marginBottom: '12px',
              hover: {
                backgroundColor: appConfig.theme.colors.neutrals[700],
              }
            }}
          >
            <Box
              styleSheet={{
                display: 'flex',
                marginBottom: '8px',
              }}
            >
              <Image
                styleSheet={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  display: 'inline-block',
                  marginRight: '8px',
                }}
                src={`https://github.com/${mensagem.de}.png`}
              />
              <Text tag="strong">
                {mensagem.de}
              </Text>
              <Text
                styleSheet={{
                  fontSize: '10px',
                  marginLeft: '8px',
                  color: appConfig.theme.colors.neutrals[300],
                }}
                tag="span"
              >
                {(new Date().toLocaleDateString())}
              </Text>
              <Button
                iconName='times'
                onClick={() => props.handleRemoverMensagem(mensagem.id)}
                style={{
                  fontSize: '12px',
                  height: '18px',
                  width: '18px',
                }}
                styleSheet={{
                  marginLeft: '10px',
                  marginTop: '-6px',
                  backgroundColor: appConfig.theme.colors.neutrals[700],
                  hover: {
                    backgroundColor: appConfig.theme.colors.primary[700]
                  },
                  focus: {
                    backgroundColor: appConfig.theme.colors.primary[700]
                  }
                }}
              >
              </Button>
            </Box>
            {mensagem.texto.startsWith(':sticker:')
              ? (<Image src={mensagem.texto.replace(':sticker:', '')}
                styleSheet={{
                  maxWidth: '25vh'
                }}
              />) : (mensagem.texto)
            }
          </Text>
        );
      })}
    </Box>
  )
}