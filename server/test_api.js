import axios from 'axios';

async function test() {
  console.log('Testing server endpoints...');
  try {
    const health = await axios.get('http://localhost:5000/api/health');
    console.log('1. Health check:', health.data);

    const home = await axios.get('http://localhost:5000/api/home');
    console.log('2. Home featured:', home.data.data?.featured?.length, 'latest:', home.data.data?.latest?.length);
    console.log('Sample latest:', home.data.data?.latest?.[0]?.title);

    const sampleSlug = home.data.data?.latest?.[0]?.slug || 'magic-emperor';
    console.log('Testing comic detail for slug:', sampleSlug);
    const detail = await axios.get(`http://localhost:5000/api/comic/${sampleSlug}`);
    console.log('3. Detail title:', detail.data.data?.title, 'total chapters:', detail.data.data?.totalChapters);

    if (detail.data.data?.chapters?.[0]) {
      const chSlug = detail.data.data.chapters[0].slug;
      console.log('Testing chapter images for:', chSlug);
      const chData = await axios.get(`http://localhost:5000/api/chapter/${chSlug}`);
      console.log('4. Chapter title:', chData.data.data?.chapterTitle, 'total images:', chData.data.data?.totalImages);
      if (chData.data.data?.images?.[0]) {
        console.log('Sample image URL:', chData.data.data.images[0].url);
      }
    }

    const search = await axios.get('http://localhost:5000/api/search?q=solo');
    console.log('5. Search results for "solo":', search.data.data?.results?.length);
    
    console.log('ALL API ENDPOINTS TESTED SUCCESSFULLY!');
  } catch (err) {
    console.error('Test error:', err.response?.data || err.message);
  }
}

test();
