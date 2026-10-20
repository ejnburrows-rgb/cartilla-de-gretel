import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { CowGame } from '../../components/cartilla/games/cow/CowGame';

export const Route = createFileRoute('/cartilla/juego/cow')({
  component: CowGame,
});
