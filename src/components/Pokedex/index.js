import React from 'react';

import classes from './styles.module.css';
import Page from '../../ui-components/Page';
import DoneOutlineRoundedIcon from '@material-ui/icons/DoneOutlineRounded';
import { InputAdornment } from '@material-ui/core';
import Input from '../../ui-components/Input';
import Iconbutton from '../../ui-components/Button/Iconbutton';
import { getPathValue, handleError, isEmptyList, isEmptyObject, isEmptyString } from '../../utils';
import { themed } from '../../utils/theme';
import { RED_500, RED_700 } from '../../resources/colors';
import SnackBar from '../../ui-components/SnackBar';
import { POKEMON_API_BASE, POKEMON_TYPES } from '../../resources/constants';

export default class Pokedex extends React.Component {

    state = {
        loader: true,
        index: 1,
        name: 'Pikachu',
        pokemonData: null,
        error: null
    }

    updateComponent = (refresher = null) => refresher && this.setState({ refresher });

    fetchPokemonData = pokemon => this.setState({ loader: true }, () => fetch(`${POKEMON_API_BASE}${pokemon}`)
        .then(handleError)
        .then(res => res.json())
        .then(data => this.setState({ loader: false, pokemonData: data, snack: null }))
        .catch(error => this.setState({
            loader: false, snack: {
                open: true,
                message: error.message || 'No Pokémon found',
                severity: 'error'
            }
        })));

    handleValueChange = (e, key) => {
        if (isEmptyString(key)) return;
        const value = e.target.value;
        this.setState({ [key]: value });
    }

    handleIndexSubmit = () => {
        const index = this.state.index;
        if (index < 1) this.setState({ error: { ...this.state.error, index: { error: true, label: 'Index cannot be less than 1' } } });
        else this.setState({ error: { ...this.state.error, index: { error: false, label: '' } } }, () => this.fetchPokemonData(index));
    }

    handleNameSubmit = () => {
        const name = this.state.name;
        if (isEmptyString(name)) this.setState({ error: { ...this.state.error, name: { error: true, label: 'Name cannot be empty' } } });
        else this.setState({ error: { ...this.state.error, name: { error: false, label: '' } } }, () => this.fetchPokemonData(name.toLowerCase()));
    }

    handleSnackClose = () => this.setState({ snack: { ...this.state.snack, open: false } });

    getPokemonAvatar = data => isEmptyObject(data) ? '' : getPathValue(data, 'sprites.other.dream_world.front_default') || getPathValue(data, 'sprites.front_default', '');

    getTypeChipStyles = type => !isEmptyString(type) && type.toLowerCase() in POKEMON_TYPES ?
        ({ backgroundColor: POKEMON_TYPES[type.toLowerCase()]['bgColor'], color: POKEMON_TYPES[type.toLowerCase()]['color'] }) :
        ({ backgroundColor: '#da9443', color: '#FFF' });

    render = () => {
        const { index, name, error, snack, pokemonData } = this.state;

        return <Page shouldComponentUpdate={this.updateComponent}>
            <div className={classes.title}>Pokédex</div>
            <div className={classes.inputContainer}>
                <div className={classes.label}>Search <span className={classes.pokemonTitle}>Pokémon</span> by index or name</div>
                <div className={classes.inputWrapper}>
                    <div className={classes.searchInput}>
                        <Input autoComplete='off' id='index' type='number' label='Index' onChange={e => this.handleValueChange(e, 'index')}
                            value={index} variant='outlined' rootInputStyles={{ color: 'var(--text)', borderRadius: 'inherit' }}
                            error={error?.index?.error} helperText={error?.index?.label} helpertextcolor={themed(RED_700, RED_500)}
                            InputProps={{
                                endAdornment: <InputAdornment position='end'>
                                    <Iconbutton iconColor='var(--text)' onClick={() => this.handleIndexSubmit()} icon={<DoneOutlineRoundedIcon />}></Iconbutton></InputAdornment>
                            }} />
                    </div>
                    <div className={classes.searchInput}>
                        <Input autoComplete='off' id='name' label='Name' onChange={e => this.handleValueChange(e, 'name')}
                            value={name} variant='outlined' rootInputStyles={{ color: 'var(--text)', borderRadius: 'inherit' }}
                            error={error?.name?.error} helperText={error?.name?.label} helpertextcolor={themed(RED_700, RED_500)}
                            InputProps={{
                                endAdornment: <InputAdornment position='end'>
                                    <Iconbutton iconColor='var(--text)' onClick={() => this.handleNameSubmit()} icon={<DoneOutlineRoundedIcon />}></Iconbutton></InputAdornment>
                            }} />
                    </div>
                </div>
            </div>
            {pokemonData && <div className={classes.pokedexContainer}>
                {pokemonData?.sprites && !isEmptyObject(pokemonData.sprites) && <div className={classes.imageContainer}>
                    <img src={this.getPokemonAvatar(pokemonData)} alt='pokemon-sprite' className={classes.sprite}></img>
                </div>}
                {pokemonData?.name && <div className={classes.name}>{pokemonData.name}</div>}
                <div className={classes.infoWrapper}>
                    {pokemonData?.id && <div className={classes.indexWrapper}>
                        <div className={classes.infoLabel}>Index</div>
                        <div className={classes.infoValue}>{pokemonData.id}</div>
                    </div>}
                    {pokemonData?.base_experience && <div className={classes.xpWrapper}>
                        <div className={classes.infoLabel}>Base XP</div>
                        <div className={classes.infoValue}>{pokemonData.base_experience}</div>
                    </div>}
                </div>
                {pokemonData?.types && !isEmptyList(pokemonData.types) && <>
                    <div className={classes.typeLabel}>Type</div>
                    <div className={classes.typesWrapper}>
                        {pokemonData.types.map((type, index) => !isEmptyString(type?.type?.name) && <div key={`type-${index}`} className={classes.typeChip} style={this.getTypeChipStyles(type.type.name)}>
                            {type.type.name}
                        </div>)}
                    </div>
                </>}
            </div>}
            {snack?.message && <SnackBar message={snack.message} severity={snack.severity} handleClose={this.handleSnackClose} open={snack.open} />}
        </Page>
    }
}