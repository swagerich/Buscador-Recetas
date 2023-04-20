const categories = document.querySelector("#categorias");

const result = document.querySelector("#resultado");

const modal = new bootstrap.Modal('#modal',{});

const favoritosDiv = document.querySelector('.favoritos');

window.addEventListener("load", () => {
  initializer();

});

function initializer() {
  if(categories){
    categories.addEventListener("change", selectionCategory);
    getAllCategories();
  }

  if(favoritosDiv){
    getFavorites();
  }


  async function getAllCategories() {
    const URL = "https://www.themealdb.com/api/json/v1/1/categories.php";
    try {
      const response = await fetch(URL);
      const data = await response.json();
      viewCategories(data.categories);
    } catch (e) {
      console.log(e);
    }
  }
}

function viewCategories(datos = []) {
  datos.forEach((category) => {
    const { strCategory } = category;
    const option = document.createElement("option");
    option.textContent = strCategory;
    option.value = strCategory;
    categories.appendChild(option);
  });
}


 function selectionCategory(e) {
  const category = e.target.value;
  getDetailsByCategory(category);
}

function showRecipes( recipes = [] ){
  clearHtml(result);

  const heading = document.createElement('h2');
    heading.classList.add('text-center','text-black','my-5');
    heading.textContent= recipes.length > 0 ? 'Resultados' : ' No hay Resultados';
    result.appendChild(heading);

  recipes.forEach(recipe =>{

    const {idMeal,strMeal,strMealThumb} = recipe;

    const recipeContainer = document.createElement('div');
    recipeContainer.classList.add=('col-md-4');

    const recipeCard = document.createElement('div');
    recipeCard.classList.add('card','mb-4');

    const recipeImage = document.createElement('img');
    recipeImage.classList.add('card-img-top');
    recipeImage.alt=`Imagen de la receta ${strMeal}`;
    recipeImage.src=strMealThumb ?? recipe.img;

    const recipeCardBody = document.createElement('div');
    recipeCardBody.classList.add('card-body');

    const recipeHeading = document.createElement('h3');
    recipeHeading.classList.add('card-title','mb-3');
    recipeHeading.textContent = strMeal ?? recipe.title;

    const recipeButton = document.createElement('button');
    recipeButton.classList.add('btn','btn-primary','w-100');
    recipeButton.textContent='ver';
    //recipeButton.dataset.bsTarget='#modal';
    //recipeButton.dataset.bsToggle='modal';
    recipeButton.onclick= () => {
      getRecipeId(idMeal ?? recipe.id);
    }


    recipeCardBody.appendChild(recipeHeading);
    recipeCardBody.appendChild(recipeButton);

    recipeCard.appendChild(recipeImage);
    recipeCard.appendChild(recipeCardBody);

    recipeContainer.appendChild(recipeCard);
    
    result.appendChild(recipeContainer);
  });

}

function viewDetailsRecipe(recipe){

    const {idMeal,strMeal,
      strCategory,
      strArea,
      strInstructions,
      strMealThumb,
      strTags,
      strYoutube,
      } = recipe;
    
   
    const modalTitle = document.querySelector(".modal .modal-title");
    const modalBody = document.querySelector(".modal .modal-body");

    modalTitle.textContent=strMeal;
    modalBody.innerHTML=`
      <img class="img-fluid" src="${strMealThumb}" alt=receta ${strMeal}/>
      <h3 class="my-3">Comida</h3>
      <p>${strArea}</p>
      <h3 class="my-3">Instrucciones</h3>
      <p>${strInstructions}<p>
      <h3 class="my-3">Ingredientes y Cantidades</h3>
    `;

    const listGroup = document.createElement('ul');
    listGroup.classList.add('list-group');
    for(let i=1; i<20;i++){
      if(recipe[`strIngredient${i}`]){
        const  ingredient = recipe[`strIngredient${i}`];
        const quantity = recipe[`strMeasure${i}`];
        const ingredientLi = document.createElement('li');
        ingredientLi.classList.add('list-group-item');
        ingredientLi.textContent=`${ingredient} - ${quantity}`
        listGroup.appendChild(ingredientLi);
      }
    }

    modalBody.appendChild(listGroup);

    const modalFooter = document.querySelector('.modal-footer');
    clearHtml(modalFooter);

    const btnFavorite = document.createElement('button');
    btnFavorite.classList.add('btn','btn-primary','col');
    btnFavorite.textContent= exitsStorage(idMeal) ? 'Eliminar favorito' :'Agregar Favorito';

    btnFavorite.onclick  = () =>{

      if(exitsStorage(idMeal)){
        deleteFavorite(idMeal);
        btnFavorite.textContent='Agregar Favorito';
        showToast('Se elimino de favoritos','bg-danger');
        return;
      }
        addFavorite({
          id:idMeal,
          title:strMeal,
          img:strMealThumb
        });
        btnFavorite.textContent='Eliminar favorito';
        showToast('se agrego a favoritos','bg-primary')
    }
    modalFooter.appendChild(btnFavorite);


    const btnCloseModal = document.createElement('button');
    btnCloseModal.classList.add('btn','btn-danger','col');
    btnCloseModal.textContent='Cerrar';
    btnCloseModal.onclick = () => {
      modal.hide()
    }
    modalFooter.appendChild(btnCloseModal);

    modal.show();
  
}

function addFavorite(recipe){
  //convertimos a un objeto
  const favorites = JSON.parse(localStorage.getItem('favoritos')) ?? [];
  //convertimos a string
  localStorage.setItem('favoritos',JSON.stringify([...favorites,recipe])); 
}

function deleteFavorite(id){
  const favorites = JSON.parse(localStorage.getItem('favoritos')) ?? [];
  const newFavorites = favorites.filter(favorite => favorite.id !== id);
  localStorage.setItem('favoritos',JSON.stringify(newFavorites));
}

function getFavorites(){
  const favorites = JSON.parse(localStorage.getItem('favoritos')) ?? [];
  if(favorites.length <= 0){
    const noFavorites = document.createElement('p');
    noFavorites.classList.add('fs-4','text-center','font-bold','mt-5');
    noFavorites.textContent='No hay favoritos aun';
    result.appendChild(noFavorites);
  }else{
    showRecipes(favorites);
    return;
  }

   
}

function exitsStorage(id){
  const getFavorites = JSON.parse(localStorage.getItem('favoritos'))  ?? [];
   return getFavorites.some(favorite => favorite.id === id);
}

function showToast(message,clase){
  const toastDiv = document.querySelector('#toast');
  const toastBody = document.querySelector('.toast-body');
  const toastHeader = document.querySelector('.toast-header')

  if(toastHeader){
    toastHeader.classList.remove('bg-danger');
    toastHeader.classList.remove('bg-primary');
  }
    toastHeader.classList.add(clase)

  const toast = new bootstrap.Toast(toastDiv);
  toastBody.textContent=message;
  toast.show();
}
 
async function getRecipeId(recipeId){
  const URL = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`;
  try{
    const response = await fetch(URL);
    const data = await response.json();
    viewDetailsRecipe(data.meals[0])
  }catch(e){
    console.log('error',e);
  }
}


async function getDetailsByCategory(category) {
  const URL = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`;
  try {
    const response = await fetch(URL);
    const data = await response.json();
    showRecipes(data.meals);
    
  } catch (e) {
    console.log("error al  consumir detalles de la categoria", e);
  }
}

function clearHtml(select){
  while(select.firstChild){
    select.removeChild(select.firstChild);
  }
}
