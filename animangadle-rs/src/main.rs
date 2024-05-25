use std::fs::File;
use std::io::Write;

use chrono;

use dotenvy::dotenv;
use std::env;

use mal_api::anime::api::Client as AnimeClient;
use mal_api::manga::api::Client as MangaClient;
use mal_api::oauth::MalClientId;
use mal_api::prelude::*;

async fn get_top_anime(
    client: &AnimeApiClient<AnimeClient>,
    ranking_type: RankingType,
    fields: &AnimeCommonFields,
    rank_limit: u16,
) -> Option<Vec<AnimeRankingNode>> {
    let query = GetAnimeRanking::builder(ranking_type)
        .fields(&fields)
        .limit(rank_limit)
        .build();
    let response = client.get_anime_ranking(&query).await;
    match response {
        Ok(r) => return Some(r.data),
        Err(_) => return None,
    }
}

async fn get_top_manga(
    client: &MangaApiClient<MangaClient>,
    ranking_type: MangaRankingType,
    fields: &MangaCommonFields,
    rank_limit: u16,
) -> Option<Vec<MangaRankingNode>> {
    let query = GetMangaRanking::builder(ranking_type)
        .fields(&fields)
        .limit(rank_limit)
        .build();
    let response = client.get_manga_ranking(&query).await;
    match response {
        Ok(r) => return Some(r.data),
        Err(_) => return None,
    }
}

#[tokio::main]
async fn main() -> Result<(), std::io::Error> {
    dotenv().ok();
    let api_key = env::var("API_KEY").expect("API_KEY must be set");
    let client_id = MalClientId::new(api_key);
    let anime_api_client = AnimeApiClient::from(&client_id);
    let manga_api_client = MangaApiClient::from(&client_id);
    
    let anime_fields = AnimeCommonFields(
        vec![
            AnimeField::id,
            AnimeField::title, 
            AnimeField::main_picture,
            AnimeField::alternative_titles,
            AnimeField::start_date,
            AnimeField::end_date,
            AnimeField::mean,
            AnimeField::rank,
            AnimeField::popularity,
            AnimeField::genres,
            AnimeField::media_type,
            AnimeField::status,
            AnimeField::num_episodes,
            AnimeField::studios
        ]
    );
    let manga_fields = MangaCommonFields(
        vec![
            MangaField::id,
            MangaField::title, 
            MangaField::main_picture,
            MangaField::alternative_titles,
            MangaField::start_date,
            MangaField::end_date,
            MangaField::mean,
            MangaField::rank,
            MangaField::popularity,
            MangaField::genres,
            MangaField::media_type,
            MangaField::status,
            MangaField::num_volumes,
            MangaField::num_chapters
        ]
    );

    let top_animes_response = get_top_anime(
        &anime_api_client, 
        RankingType::All, 
        &anime_fields, 
        200,
    )
    .await;
    let top_mangas_response = get_top_manga(
        &manga_api_client,
        MangaRankingType::All,
        &manga_fields,
        200,
    )
    .await;

    if let Some(ref top_animes) = top_animes_response {
        let mut anime_file = File::create("../../anime.json")?;
        anime_file.write_all(serde_json::to_string(&top_animes).unwrap().as_bytes())?;
        println!(
            "{:?}: Successfully retrieved anime list given rank_limit",
            chrono::offset::Local::now()
        );
    } else {
        println!(
            "{:?}: Failed to retrieve anime list given rank_limit",
            chrono::offset::Local::now()
        );
    }
    if let Some(ref top_mangas) = top_mangas_response {
        let mut manga_file = File::create("../../manga.json")?;
        manga_file.write_all(serde_json::to_string(&top_mangas).unwrap().as_bytes())?;
        println!(
            "{:?}: Successfully retrieved manga list given rank_limit",
            chrono::offset::Local::now()
        );
    } else {
        println!(
            "{:?}: Failed to retrieve manga list give rank_limit",
            chrono::offset::Local::now()
        );
    }
    Ok(())
}
